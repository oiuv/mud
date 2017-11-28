// xianxing.c 现形炸弹

#include <ansi.h>

inherit ITEM;

int filter_user(object ob);

void create()
{
	set_name(HIR "现形炸弹" NOR, ({ "visible bomb", "bomb" }));
	set_weight(100);
	if( clonep() )
		set_default_object(__FILE__);
	else {
                set("long", "听说这是可以让人原形毕露的炸弹。\n");
                set("value", 1);
                set("no_sell", 1);
                set("unit", "颗");
	}
}

void init()
{
        add_action("do_bomb", "bomb");
}

int do_bomb()
{
        object me;
        object *ob;
        string msg;

        me = this_player();
        message_vision(HIM "$N大喝道：“统统给我现形！”说罢把手中的炸弹"
                       "一扔，就听“轰”的一声！\n" NOR, me);

        ob = filter_array(all_inventory(environment(me)), (: filter_user :));
        switch (sizeof(ob))
        {
        case 0:
                msg = HIG "一阵烟雾过后，什么变化也没有，只见$N呵呵的不住傻笑。\n" NOR;
                break;
        case 1:
                if (ob[0] == me)
                        msg = HIC "一阵烟雾过后，只有$N" HIC "自己被炸得浑"
                               "身是烟，原形毕露。\n" NOR;
                else
                        msg = HIC "一阵烟雾过后，" HIG + ob[0]->name() +
                               HIC "被炸得浑身是烟，躺在地上“嗷嗷”直叫。\n" NOR;
                break;
        default:
                msg = HIC "一阵烟雾过后，一堆人被炸得浑身是烟，原形毕"
                       "露。\n" NOR;
                break;
        }

        message_vision(msg, me);
        destruct(this_object());
        return 1;
}

int filter_user(object ob)
{
        if (! userp(ob))
                return 0;

        if (ob->query("env/invisible"))
        {
                ob->delete("env/invisible");
                CHANNEL_D->do_channel(this_object(), "rumor", "听说" + ob->name(1) +
                                      HIM "被炸得现了形。");
                return 1;
        }

        if (! undefinedp(ob->query_temp("apply/name")))
        {
                object mask;
                string msg;

                msg = "听说" + ob->name(1) + HIM "假扮" + ob->name() +
                      HIM "被炸出了原形，浑身上下都是小烟";
		ob->delete_temp("apply/name");
		ob->delete_temp("apply/id");
		ob->delete_temp("apply/short");
		ob->delete_temp("apply/long");
                if (objectp(mask = present("mian ju", ob)))
                {
                        msg += "，连" + mask->name() + HIM "都被烧坏了。";
                        destruct(mask);
                } else
                        msg += "。";
                CHANNEL_D->do_channel(this_object(), "rumor", msg);
                return 1;
        }

        return 0;
}

