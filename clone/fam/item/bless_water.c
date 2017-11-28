// 乾坤圣水用于圣化兵器

#include <ansi.h>

inherit ITEM;

void create()
{
	set_name(HIW "乾坤圣水" NOR, ({ "bless water", "water" }) );
	set_weight(30);

	if (clonep())
		set_default_object(__FILE__);
        else {
                set("long", HIW "一瓶莹剔透圣水，散射出绚目的光彩。\n"
                            "他可以用来圣化（bless）兵器或防具。\n" NOR);
                set("value", 1);
                set("no_sell", 1);
        	set("unit", "瓶");
        }

        setup();
}

void init()
{
        if (this_player() == environment())
        {
                add_action("do_bless", "bless");
        }

}

int do_bless(string arg)
{
        object me;
        object ob;
        string msg;
        me = this_player();

        if (! arg || ! objectp(ob = present(arg, me)))
                return notify_fail("你要圣化什么？\n");

        if (ob == me)
                return notify_fail("你脑潮啊？\n");

        if (! ob->is_item_make())
                return notify_fail("你只能圣化自造兵器或防具！\n");
        
        if (! stringp(ob->item_owner()) ||
              ob->item_owner() != me->query("id"))
                return notify_fail("你只能圣化自己的兵器或防具！\n");

        if (ob->query("bless") >= 30)
                return notify_fail("一件兵器或防具最多只能圣化三十次！\n");

        message_vision(HIW "\n$N将乾坤圣水缓缓洒在" + ob->name() + HIW "上，顷刻间"
                       + ob->name() + HIW "犹如烈火中重生一般，散发出绚目的光彩！\n\n", me);
        ob->add("bless", 1);
        ob->set("consistence", 100);
        ob->add("stable", 1);

        msg = HIG "通过圣化，你的" + ob->name() + "\n";
        msg += HIG "坚固度得到提升！\n";
        msg += HIG "耐久度得到提升！\n";
        msg += HIG "攻防效果得到修正！\n\n";

        tell_object(me, msg);

        destruct(this_object());
        ob->save();
        return 1;
}

int query_autoload()
{
         return 1;
}