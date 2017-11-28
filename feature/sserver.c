// sserver.c

// This function selects a random target for offensive spells/functions.
object offensive_target(object me)
{
        me->clean_up_enemy();
        return me->select_opponent();
}
