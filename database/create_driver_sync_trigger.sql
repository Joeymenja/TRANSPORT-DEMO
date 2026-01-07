-- Create a function to handle new driver creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the new user has the role 'DRIVER'
    IF NEW.role = 'DRIVER' THEN
        -- Check if a driver record already exists for this user (to prevent duplicates)
        IF NOT EXISTS (SELECT 1 FROM public.drivers WHERE user_id = NEW.id) THEN
            INSERT INTO public.drivers (
                id,
                user_id,
                organization_id,
                is_active,
                current_status,
                created_at,
                updated_at
            ) VALUES (
                uuid_generate_v4(), -- Generate a new UUID for the driver
                NEW.id,
                NEW.organization_id,
                true, -- Default to active
                'OFF_DUTY', -- Default status
                NOW(),
                NOW()
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger to execute the function after a user is inserted
DROP TRIGGER IF EXISTS on_user_created ON public.users;
CREATE TRIGGER on_user_created
    AFTER INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
