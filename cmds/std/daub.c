// daub.c

#include <ansi.h>

inherit F_CLEAN_UP;

// the flag that wether I know there is some poison on the object
#define I_KNOW                  1
#define I_DONT_KNOW             0

void check_poison(object me, object dest, int iknow);

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
	string item, target;
	object obj, dest;

	if (!arg)
                return notify_fail("你要往哪儿涂抹毒药？\n");

        if (me->is_busy())
                return notify_fail("先忙完了你的事情再想怎么害人吧！\n");

        if (me->is_fighting())
                return notify_fail("你现在正在打架，没时间做这些事情。\n");

        if (sscanf(arg, "with %s", item) == 1)
                target = "hand";
        else
        if (sscanf(arg, "%s with %s", target, item) == 2)
                ;
        else
	if (sscanf(arg, "%s on %s", item, target) == 2)
                ;
        else
                return notify_fail("你要往哪儿涂抹毒药？\n");

        if (target == "hand" || target == "me")
        {
                // daub on me
                dest = me;
        } else
        {
	        dest = present(target, me);
                if (! dest) dest = present(target, environment(me));
	        if (! dest)
                        return notify_fail("这里没有这样东西。\n");

                if (dest->is_character())
                {
                        if (dest != me && ! dest->is_corpse())
                        {
                                return notify_fail("你往" + dest->name() +
                                                   "上面涂什么，找扁啊？\n");
                        }
                        // daub on me
                } else
        	if (! mapp(dest->query("armor_prop")) &&
                    ! mapp(dest->query("weapon_prop")))
                {
                        return notify_fail("那既不是武器，也不是防具，"
                                           "你怎么涂抹毒药呢？\n");
                }
        }

	if (!objectp(obj = present(item, me)))
		return notify_fail("你身上没有这样东西。\n");

	if (!stringp(obj->query("poison_type")))
                return notify_fail(obj->name() + "不是毒药啊。\n");

        if (! obj->query("can_daub"))
                return notify_fail("这种毒药不能用来涂抹。\n");

        dest->set_temp("daub/who_id", me->query("id"));
        dest->set_temp("daub/who_name", me->query("name"));
        dest->set_temp("daub/poison_name", obj->name());
        dest->set_temp("daub/poison_type", obj->query("poison_type"));
        dest->set_temp("daub/poison", POISON->mixed_poison(dest->query_temp("daub/poison"),
                                      obj->query("poison")));
        if (dest == me)
        {
                message("vision", sprintf("%s拿出一些东西在自己身上涂来"
                                          "抹去的，不知道在干什么。\n",
                                          me->name()), environment(me), ({ me }));
                tell_object(me, HIG "你把" + obj->name() + HIG "涂抹到自己手上。\n" NOR);
                check_poison(me, dest, I_KNOW);

                if (obj->query_amount() > 1)
                        obj->add_amount(-1);
                else
	                destruct(obj);

                return 1;
        }

        message("vision", sprintf("%s拿出一些东西涂抹在%s上面。\n",
                                  me->name(), dest->name()),
                                  environment(me), ({ me }));
        tell_object(me, HIG "你把" + obj->name() + HIG "涂抹到" + dest->name() +
                        HIG "上。\n" NOR);
        if (dest->query("equipped") == "worn" &&
            dest->query("armor_type") != "hands" &&
            environment(dest) == me)
        {
                // daub on armor that I am wearing
                check_poison(me, dest, I_KNOW);
        }

        if (obj->query_amount() > 1)
                obj->add_amount(-1);
        else
	        destruct(obj);
	return 1;
}

// check wether I can sufface the poison
void check_poison(object me, object dest, int iknow)
{
        string name;
        string type;
        mapping p;
        int lvl;

        if (! dest) dest = me;
        name = dest->query_temp("daub/poison_name");
        type = dest->query_temp("daub/poison_type");
        p    = dest->query_temp("daub/poison");
        if (! name || ! p || ! type) return;

        if (p["id"] == me->query("id"))
                // The poison is made by me
                return;

        lvl = me->query_skill("force") + me->query("poison", 1) / 2;
        if (lvl < 100 || lvl < (int)p["level"])
        {
                message("vision", HIC "忽然" + me->name() + HIC "眉头"
                                  "紧缩，神情痛苦，看来是遇到麻烦了。\n" NOR,
                                  environment(me), ({ me }));
                tell_object(me, HIC "忽然你觉得有点不对劲，不好，可能是中毒了。\n" NOR);
                me->affect_by(type, p);
                dest->delete_temp("daub");
                return;
        }

        message("vision", HIC + me->name() + HIC "眉头"
                          "微微一皱，随即舒展开来。\n" NOR,
                          environment(me), ({ me }));

        if (p["level"] > 120)
        {
                if (iknow)
                        tell_object(me, HIC "你发现这" + name + HIC "毒性甚"
                                        "是猛烈，幸好内功高深，抵挡得住。\n" NOR);
                else
                        tell_object(me, HIC "你发现这" + dest->name() + HIC "上的" +
                                        name + HIC "毒性甚"
                                        "是猛烈，亏得你内功高深，才幸免无事。\n" NOR);
        } else
        if (! iknow && dest->query_temp("who_id") != me->query("id"))
        {
                tell_object(me, HIC "你发现这" + name + HIC "上面带毒。\n" NOR);
        }
}

int help(object me)
{
write(@HELP
指令格式：daub <毒品名称> on <武器> | <防具> | hand
          daub <武器> | <防具> | [hand] with <毒品名称>

这个指令可以让你将某样毒品涂抹到武器上，防具或是手上，当然涂
抹到防具或是手上的的毒最好不要使自己中毒。

相关指令：pour、drug、wash
HELP);

        return 1;
}
