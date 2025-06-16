-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create custom types
create type subscription_tier as enum ('free', 'basic', 'premium');
create type subscription_status as enum ('active', 'inactive', 'cancelled');

-- Create profiles table
create table profiles (
    id uuid references auth.users on delete cascade primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    full_name text not null,
    avatar_url text,
    subscription_tier subscription_tier default 'free'::subscription_tier not null,
    subscription_status subscription_status default 'inactive'::subscription_status not null,
    subscription_start_date timestamp with time zone,
    subscription_end_date timestamp with time zone
);

-- Create usage_logs table
create table usage_logs (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references auth.users on delete cascade not null,
    action text not null,
    details jsonb
);

-- Create subscriptions table
create table subscriptions (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references auth.users on delete cascade not null,
    tier subscription_tier not null,
    status subscription_status not null,
    start_date timestamp with time zone not null,
    end_date timestamp with time zone not null,
    stripe_customer_id text,
    stripe_subscription_id text
);

-- Create partial unique index for active subscriptions
create unique index unique_active_subscription 
    on subscriptions (user_id) 
    where status = 'active'::subscription_status;

-- Create indexes
create index profiles_subscription_tier_idx on profiles(subscription_tier);
create index usage_logs_user_id_idx on usage_logs(user_id);
create index usage_logs_created_at_idx on usage_logs(created_at);
create index subscriptions_user_id_idx on subscriptions(user_id);
create index subscriptions_status_idx on subscriptions(status);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table usage_logs enable row level security;
alter table subscriptions enable row level security;

-- Create RLS policies for profiles
create policy "Users can view their own profile"
    on profiles for select
    using (auth.uid() = id);

create policy "Users can update their own profile"
    on profiles for update
    using (auth.uid() = id);

-- Create RLS policies for usage_logs
create policy "Users can view their own usage logs"
    on usage_logs for select
    using (auth.uid() = user_id);

create policy "Users can insert their own usage logs"
    on usage_logs for insert
    with check (auth.uid() = user_id);

-- Create RLS policies for subscriptions
create policy "Users can view their own subscriptions"
    on subscriptions for select
    using (auth.uid() = user_id);

create policy "Users can insert their own subscriptions"
    on subscriptions for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own subscriptions"
    on subscriptions for update
    using (auth.uid() = user_id);

-- Create function to handle user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, full_name)
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'full_name', new.email)
    );
    return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user creation
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Create trigger for updating updated_at
create trigger handle_updated_at
    before update on profiles
    for each row execute procedure public.handle_updated_at(); 