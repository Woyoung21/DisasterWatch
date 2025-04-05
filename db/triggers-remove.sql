
-- Remove the triggers first
DROP TRIGGER events_insert_trigger ON events;
DROP TRIGGER events_update_trigger ON events;
DROP TRIGGER events_delete_trigger ON events;

-- Then remove the notification function
DROP FUNCTION notify_event_change();