#include <ansi.h>
inherit ROOM;

void create()
{
	set("short", "金刚伏魔圈");
	set("long", @LONG
三棵大松树的树干上各挖了个可容身一人的大洞，有个洞
口露出黑色僧袍一角，似乎住得有人。中央是一片大草坪，中
心处光秃秃的，似乎经常受大力击打，以致寸草不生。
LONG );
	set("exits", ([
		"out" : __DIR__"qyping",
	]));

	set("objects",([
		CLASS_D("shaolin") + "/du-nan" : 1,
		CLASS_D("shaolin") + "/du-e" : 1,
		CLASS_D("shaolin") + "/du-jie" : 1,
	]));
	setup();
}

void init()
{	
	mapping mine;
        object me;
        object ob1, ob2, ob3;

        me = this_player();
	mine = this_player()->query("family");

        if (me->query_temp("valid_in_fumoquan"))
		return;

        if (mapp(mine) &&
	    mine["family_name"] == "少林派" &&
            mine["generation"] <= 36)
        {
                me->set_temp("valid_in_fumoquan", 1);
                return;
        }

	if (! objectp(ob1 = present("du nan", this_object()))
           || ! living(ob1)
           || ! objectp(ob2 = present("du e", this_object()))
           || ! living(ob2)
           || ! objectp(ob3 = present("du jie", this_object()))
           || ! living(ob3)
           || ! interactive(me))
        {
                me->set_temp("valid_in_fumoquan", 2);
                return;
        }

        if (ultrap(me))
        {
                message_sort(WHT "\n但见三位老僧纹丝不动，镇定不若，恍"
                             "若不知道$N的到来。\n\n" NOR, me);
                CHANNEL_D->do_channel(this_object(), "rumor", "大宗师" +
                                      me->name(1) + "进入金刚伏魔圈。");
                me->set_temp("valid_in_fumoquan", 1);
                return;
        }

        message_sort(HIR "\n突然间劲气纵横，三根黑索如三条黑蟒般就地滚"
                     "来，瞬间近身，化成一条笔自的兵刃，如长矛，如杆棒"
                     "，如利剑，分别向$N的头，胸，腹三处要害疾刺而至。"
                     "$N一瞥间，看到三个老僧分居三个树洞之中，正全力持"
                     "鞭向$N攻来！$N已陷身于少林寺之蕴含无上降魔大法的"
                     "金刚伏魔圈！\n" NOR, me);

	if (mapp(mine) &&
            mine["family_name"] == "少林派" &&
            this_player()->query("combat_exp") < 100000 )
        {
	        message_vision(HIR "\n突然$N" HIR "被一道排山倒海般的劲"
                               "气击中，顿时飞了出去。\n\n" NOR, me);
                me->move("/d/shaolin/qyping");
        }

        message_vision(WHT "\n忽然间「飕」的一声，一股罡风从$N"
                       WHT "左首处悄然涌至。\n" NOR, me);

        COMBAT_D->do_attack(ob1, me, query_temp("weapon"));
        COMBAT_D->do_attack(ob1, me, query_temp("weapon"));
        COMBAT_D->do_attack(ob1, me, query_temp("weapon"));

        message_vision(WHT "\n紧跟着破空声大起，又是一股罡风从$N"
                       WHT "的右首处袭来。\n" NOR, me);

        COMBAT_D->do_attack(ob2, me, query_temp("weapon"));
        COMBAT_D->do_attack(ob2, me, query_temp("weapon"));
        COMBAT_D->do_attack(ob2, me, query_temp("weapon"));

        message_vision(WHT "\n最后只听一声「" HIW "我佛慈悲" NOR +
                       WHT "」。数股罡风已笼罩$N" WHT "周身！\n" NOR, me);

        COMBAT_D->do_attack(ob3, me, query_temp("weapon"));
        COMBAT_D->do_attack(ob3, me, query_temp("weapon"));
        COMBAT_D->do_attack(ob3, me, query_temp("weapon"));

        if (me->query("qi") < 0)
        {

                if (mapp(mine) && mine["family_name"] == "少林派")
                {
                        me->unconcious();
                        me->set_temp("valid_in_fumoquan", 2);
                } else
                {
                        me->set_temp("die_reason", "强闯金刚伏魔圈，徒然送了性命");
                        me->die();
                }
                return;
        }

        me->set_temp("valid_in_fumoquan", 1);
        message_vision(WHT "\n此时三位老僧收回鞭子，哼了一声。\n\n" NOR, me);
        CHANNEL_D->do_channel(this_object(), "rumor",
                              (mapp(mine) ? mine["family_name"] : "") +
                              me->name(1) + "闯入金刚伏魔圈。");
}

int valid_leave(object me, string dir)
{
        me->delete_temp("valid_in_fumoquan");
	return ::valid_leave(me, dir);
}

