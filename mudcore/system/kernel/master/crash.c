/**
 * @brief apply: driver挂掉时呼叫此方法
 *
 * @param crash_message
 * @param command_giver
 * @param current_object
 */
void crash(string crash_message, object command_giver, object current_object)
{
    foreach (object ob in users())
    {
        tell_object(ob, "[CORE_MASTER_OB]->crash():Damn!\nThe game is crashing.\n");
    }
    foreach (object ob in objects())
    {
        reset_eval_cost();
        catch (ob->remove());
    }
}
