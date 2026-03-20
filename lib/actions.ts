'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// ---- AUTH ----

export async function loginAction(_prevState: { error?: string } | null, formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email e password sono obbligatori' };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: 'Credenziali non valide' };
  }

  redirect('/dashboard');
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

// ---- WORK ENTRIES ----

export async function createWorkEntry(_prevState: { error?: string } | null, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Non autenticato' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id, hourly_rate, role')
    .eq('id', user.id)
    .single();

  if (!profile) return { error: 'Profilo non trovato' };

  const date = formData.get('date') as string;
  const hours = parseFloat(formData.get('hours') as string);
  const description = formData.get('description') as string;
  const notes = formData.get('notes') as string || null;
  const assigned_user_id = formData.get('assigned_user_id') as string || null;
  const formCompanyId = formData.get('company_id') as string || null;

  if (!date || !hours || !description) {
    return { error: 'Data, ore e descrizione sono obbligatori' };
  }

  if (hours <= 0 || hours > 24) {
    return { error: 'Le ore devono essere tra 0 e 24' };
  }

  let targetUserId = user.id;
  let targetCompanyId = profile.company_id;
  let targetHourlyRate = profile.hourly_rate;

  if (profile.role === 'admin') {
    if (formCompanyId) {
      targetCompanyId = formCompanyId;
    }
    if (assigned_user_id && assigned_user_id !== user.id) {
      targetUserId = assigned_user_id;
      const { data: assignedProfile } = await supabase
        .from('profiles')
        .select('company_id, hourly_rate')
        .eq('id', assigned_user_id)
        .single();
      if (assignedProfile) {
        targetHourlyRate = assignedProfile.hourly_rate;
        if (!formCompanyId) {
          targetCompanyId = assignedProfile.company_id;
        }
      }
    }
  }

  const { error } = await supabase.from('work_entries').insert({
    user_id: targetUserId,
    company_id: targetCompanyId,
    date,
    hours,
    description,
    hourly_rate: targetHourlyRate,
    notes,
  });

  if (error) return { error: error.message };

  revalidatePath('/ore');
  revalidatePath('/dashboard');
  redirect('/ore');
}

export async function updateWorkEntry(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Non autenticato' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile) return { error: 'Profilo non trovato' };

  const id = formData.get('id') as string;
  const date = formData.get('date') as string;
  const hours = parseFloat(formData.get('hours') as string);
  const description = formData.get('description') as string;
  const notes = formData.get('notes') as string || null;
  const assigned_user_id = formData.get('assigned_user_id') as string || null;
  const formCompanyId = formData.get('company_id') as string || null;

  if (!id || !date || !hours || !description) {
    return { error: 'Data, ore e descrizione sono obbligatori' };
  }

  if (hours <= 0 || hours > 24) {
    return { error: 'Le ore devono essere tra 0 e 24' };
  }

  const updateData: Record<string, unknown> = {
    date,
    hours,
    description,
    notes,
  };

  if (profile.role === 'admin') {
    if (assigned_user_id) {
      updateData.user_id = assigned_user_id;
      // Update hourly_rate based on assigned user
      const { data: assignedProfile } = await supabase
        .from('profiles')
        .select('company_id, hourly_rate')
        .eq('id', assigned_user_id)
        .single();
      if (assignedProfile) {
        updateData.hourly_rate = assignedProfile.hourly_rate;
        if (!formCompanyId) {
          updateData.company_id = assignedProfile.company_id;
        }
      }
    }
    if (formCompanyId) {
      updateData.company_id = formCompanyId;
    }
  }

  let updateQuery = supabase
    .from('work_entries')
    .update(updateData)
    .eq('id', id);

  if (profile.role !== 'admin') {
    updateQuery = updateQuery.eq('user_id', user.id);
  }

  const { error } = await updateQuery;

  if (error) return { error: error.message };

  revalidatePath('/ore');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function deleteWorkEntry(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Non autenticato' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile) return { error: 'Profilo non trovato' };

  const id = formData.get('id') as string;

  let deleteQuery = supabase
    .from('work_entries')
    .delete()
    .eq('id', id);

  if (profile.role !== 'admin') {
    deleteQuery = deleteQuery.eq('user_id', user.id);
  }

  const { error } = await deleteQuery;

  if (error) return { error: error.message };

  revalidatePath('/ore');
  revalidatePath('/dashboard');
  return { success: true };
}

// ---- EXPENSE ENTRIES ----

export async function createExpenseEntry(_prevState: { error?: string } | null, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Non autenticato' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id, role')
    .eq('id', user.id)
    .single();

  if (!profile) return { error: 'Profilo non trovato' };

  const date = formData.get('date') as string;
  const amount = parseFloat(formData.get('amount') as string);
  const category = formData.get('category') as string;
  const description = formData.get('description') as string;
  const attachment_name = formData.get('attachment_name') as string || null;
  const notes = formData.get('notes') as string || null;
  const assigned_user_id = formData.get('assigned_user_id') as string || null;

  if (!date || !amount || !category || !description) {
    return { error: 'Data, importo, categoria e descrizione sono obbligatori' };
  }

  if (amount <= 0) {
    return { error: "L'importo deve essere positivo" };
  }

  // Admin can assign to a different user and/or override company
  const formCompanyId = formData.get('company_id') as string || null;
  let targetUserId = user.id;
  let targetCompanyId = profile.company_id;

  if (profile.role === 'admin') {
    if (formCompanyId) {
      // Admin explicitly chose a company
      targetCompanyId = formCompanyId;
    }
    if (assigned_user_id && assigned_user_id !== user.id) {
      targetUserId = assigned_user_id;
      // Derive company from assigned user only if admin didn't explicitly pick one
      if (!formCompanyId) {
        const { data: assignedProfile } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', assigned_user_id)
          .single();
        if (assignedProfile) {
          targetCompanyId = assignedProfile.company_id;
        }
      }
    }
  }

  const { error } = await supabase.from('expense_entries').insert({
    user_id: targetUserId,
    company_id: targetCompanyId,
    date,
    amount,
    category,
    description,
    attachment_name,
    notes,
  });

  if (error) return { error: error.message };

  revalidatePath('/spese');
  revalidatePath('/dashboard');
  redirect('/spese');
}

export async function updateExpenseEntry(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Non autenticato' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, company_id')
    .eq('id', user.id)
    .single();

  if (!profile) return { error: 'Profilo non trovato' };

  const id = formData.get('id') as string;
  const date = formData.get('date') as string;
  const amount = parseFloat(formData.get('amount') as string);
  const category = formData.get('category') as string;
  const description = formData.get('description') as string;
  const attachment_name = formData.get('attachment_name') as string || null;
  const notes = formData.get('notes') as string || null;
  const assigned_user_id = formData.get('assigned_user_id') as string || null;

  if (!id || !date || !amount || !category || !description) {
    return { error: 'Data, importo, categoria e descrizione sono obbligatori' };
  }

  if (amount <= 0) {
    return { error: "L'importo deve essere positivo" };
  }

  const updateData: Record<string, unknown> = {
    date,
    amount,
    category,
    description,
    attachment_name,
    notes,
  };

  // Admin can reassign to a different user and/or override company
  const formCompanyId = formData.get('company_id') as string || null;

  if (profile.role === 'admin') {
    if (assigned_user_id) {
      updateData.user_id = assigned_user_id;
    }
    if (formCompanyId) {
      // Admin explicitly chose a company
      updateData.company_id = formCompanyId;
    } else if (assigned_user_id) {
      // Derive company from assigned user
      const { data: assignedProfile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', assigned_user_id)
        .single();
      if (assignedProfile) {
        updateData.company_id = assignedProfile.company_id;
      }
    }
  }

  let updateQuery = supabase
    .from('expense_entries')
    .update(updateData)
    .eq('id', id);

  // Non-admin can only update their own entries
  if (profile.role !== 'admin') {
    updateQuery = updateQuery.eq('user_id', user.id);
  }

  const { error } = await updateQuery;

  if (error) return { error: error.message };

  revalidatePath('/spese');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function deleteExpenseEntry(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Non autenticato' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile) return { error: 'Profilo non trovato' };

  const id = formData.get('id') as string;

  let deleteQuery = supabase
    .from('expense_entries')
    .delete()
    .eq('id', id);

  // Non-admin can only delete their own entries
  if (profile.role !== 'admin') {
    deleteQuery = deleteQuery.eq('user_id', user.id);
  }

  const { error } = await deleteQuery;

  if (error) return { error: error.message };

  revalidatePath('/spese');
  revalidatePath('/dashboard');
  return { success: true };
}

// ---- ADMIN: CREATE USER ----

export async function createUserAction(_prevState: { error?: string } | null, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Non autenticato' };

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (adminProfile?.role !== 'admin') return { error: 'Non autorizzato' };

  const full_name = formData.get('full_name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const company_id = formData.get('company_id') as string;
  const role = formData.get('role') as string;
  const hourly_rate = parseFloat(formData.get('hourly_rate') as string) || 0;

  if (!full_name || !email || !password || !company_id || !role) {
    return { error: 'Tutti i campi sono obbligatori' };
  }

  const adminClient = await createAdminClient();

  const { data: newUser, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) return { error: authError.message };

  const { error: profileError } = await adminClient.from('profiles').insert({
    id: newUser.user.id,
    full_name,
    company_id,
    role,
    hourly_rate,
  });

  if (profileError) return { error: profileError.message };

  revalidatePath('/admin/utenti');
  redirect('/admin/utenti');
}

// ---- ADMIN: UPDATE USER ----

export async function updateUserAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Non autenticato' };

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (adminProfile?.role !== 'admin') return { error: 'Non autorizzato' };

  const userId = formData.get('user_id') as string;
  const full_name = formData.get('full_name') as string;
  const email = formData.get('email') as string;
  const company_id = formData.get('company_id') as string;
  const role = formData.get('role') as string;
  const hourly_rate = parseFloat(formData.get('hourly_rate') as string);

  if (!full_name || !role || !company_id) {
    return { error: 'Nome, azienda e ruolo sono obbligatori' };
  }

  const adminClient = await createAdminClient();

  // Update profile (name, company, role, rate)
  const { error: profileError } = await adminClient
    .from('profiles')
    .update({ full_name, company_id, role, hourly_rate })
    .eq('id', userId);

  if (profileError) return { error: profileError.message };

  // Update email in auth if changed
  if (email) {
    const { error: authError } = await adminClient.auth.admin.updateUserById(userId, {
      email,
    });
    if (authError) return { error: authError.message };
  }

  revalidatePath('/admin/utenti');
  revalidatePath('/dashboard');
  return { success: true };
}

// ---- REVENUE ENTRIES (INCASSI) ----

export async function createRevenueEntry(_prevState: { error?: string } | null, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Non autenticato' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id, role')
    .eq('id', user.id)
    .single();

  if (!profile) return { error: 'Profilo non trovato' };

  const date = formData.get('date') as string;
  const amount = parseFloat(formData.get('amount') as string);
  const description = formData.get('description') as string;
  const source = formData.get('source') as string;
  const client_name = formData.get('client_name') as string || null;
  const invoice_number = formData.get('invoice_number') as string || null;
  const stripe_payment_id = formData.get('stripe_payment_id') as string || null;
  const stripe_invoice_id = formData.get('stripe_invoice_id') as string || null;
  const stripe_customer_id = formData.get('stripe_customer_id') as string || null;
  const status = formData.get('status') as string || 'confirmed';
  const notes = formData.get('notes') as string || null;
  const assigned_user_id = formData.get('assigned_user_id') as string || null;
  const formCompanyId = formData.get('company_id') as string || null;

  if (!date || !amount || !description || !source) {
    return { error: 'Data, importo, descrizione e fonte sono obbligatori' };
  }

  if (amount <= 0) {
    return { error: "L'importo deve essere positivo" };
  }

  let targetUserId = user.id;
  let targetCompanyId = profile.company_id;

  if (profile.role === 'admin') {
    if (formCompanyId) {
      targetCompanyId = formCompanyId;
    }
    if (assigned_user_id && assigned_user_id !== user.id) {
      targetUserId = assigned_user_id;
      if (!formCompanyId) {
        const { data: assignedProfile } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', assigned_user_id)
          .single();
        if (assignedProfile) {
          targetCompanyId = assignedProfile.company_id;
        }
      }
    }
  }

  const { error } = await supabase.from('revenue_entries').insert({
    user_id: targetUserId,
    company_id: targetCompanyId,
    date,
    amount,
    description,
    source,
    client_name,
    invoice_number,
    stripe_payment_id,
    stripe_invoice_id,
    stripe_customer_id,
    status,
    notes,
  });

  if (error) return { error: error.message };

  revalidatePath('/incassi');
  revalidatePath('/dashboard');
  redirect('/incassi');
}

export async function updateRevenueEntry(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Non autenticato' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile) return { error: 'Profilo non trovato' };

  const id = formData.get('id') as string;
  const date = formData.get('date') as string;
  const amount = parseFloat(formData.get('amount') as string);
  const description = formData.get('description') as string;
  const source = formData.get('source') as string;
  const client_name = formData.get('client_name') as string || null;
  const invoice_number = formData.get('invoice_number') as string || null;
  const status = formData.get('status') as string || 'confirmed';
  const notes = formData.get('notes') as string || null;
  const assigned_user_id = formData.get('assigned_user_id') as string || null;
  const formCompanyId = formData.get('company_id') as string || null;

  if (!id || !date || !amount || !description || !source) {
    return { error: 'Data, importo, descrizione e fonte sono obbligatori' };
  }

  if (amount <= 0) {
    return { error: "L'importo deve essere positivo" };
  }

  const updateData: Record<string, unknown> = {
    date,
    amount,
    description,
    source,
    client_name,
    invoice_number,
    status,
    notes,
  };

  if (profile.role === 'admin') {
    if (assigned_user_id) {
      updateData.user_id = assigned_user_id;
      if (!formCompanyId) {
        const { data: assignedProfile } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', assigned_user_id)
          .single();
        if (assignedProfile) {
          updateData.company_id = assignedProfile.company_id;
        }
      }
    }
    if (formCompanyId) {
      updateData.company_id = formCompanyId;
    }
  }

  let updateQuery = supabase
    .from('revenue_entries')
    .update(updateData)
    .eq('id', id);

  if (profile.role !== 'admin') {
    updateQuery = updateQuery.eq('user_id', user.id);
  }

  const { error } = await updateQuery;

  if (error) return { error: error.message };

  revalidatePath('/incassi');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function deleteRevenueEntry(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Non autenticato' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile) return { error: 'Profilo non trovato' };

  const id = formData.get('id') as string;

  let deleteQuery = supabase
    .from('revenue_entries')
    .delete()
    .eq('id', id);

  if (profile.role !== 'admin') {
    deleteQuery = deleteQuery.eq('user_id', user.id);
  }

  const { error } = await deleteQuery;

  if (error) return { error: error.message };

  revalidatePath('/incassi');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function disableUserAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Non autenticato' };

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (adminProfile?.role !== 'admin') return { error: 'Non autorizzato' };

  const userId = formData.get('user_id') as string;

  const adminClient = await createAdminClient();
  const { error } = await adminClient.auth.admin.updateUserById(userId, {
    ban_duration: 'none',
    user_metadata: { disabled: true },
  });

  // Ban the user
  const { error: banError } = await adminClient.auth.admin.updateUserById(userId, {
    ban_duration: '876000h', // ~100 years
  });

  if (banError) return { error: banError.message };

  revalidatePath('/admin/utenti');
  return { success: true };
}
