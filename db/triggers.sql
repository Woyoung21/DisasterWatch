-- Create notification function
CREATE OR REPLACE FUNCTION notify_event_change() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM pg_notify('events_channel', json_build_object('operation', TG_OP, 'record', row_to_json(NEW))::text);
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM pg_notify('events_channel', json_build_object('operation', TG_OP, 'record', row_to_json(NEW))::text);
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM pg_notify('events_channel', json_build_object('operation', TG_OP, 'record', row_to_json(OLD))::text);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers on events table
CREATE TRIGGER events_insert_trigger AFTER INSERT ON events
  FOR EACH ROW EXECUTE FUNCTION notify_event_change();

CREATE TRIGGER events_update_trigger AFTER UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION notify_event_change();

CREATE TRIGGER events_delete_trigger AFTER DELETE ON events
  FOR EACH ROW EXECUTE FUNCTION notify_event_change();


