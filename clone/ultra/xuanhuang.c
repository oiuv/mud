// xuanhuang.c 玄黄紫清丹

#include <ansi.h>

inherit ITEM;

void create()
{
	set_name(HIM "玄黄紫清丹" NOR, ({ "xuanhuang dan", "dan" }) );
	set_weight(300);
	if( clonep() )
		set_default_object(__FILE__);
	else {
                set("long", "一颗紫中泛黄的精致奇丹，具有这神话般的功效，"
                            "是练武人梦寐以求的妙药。\n");
                set("value", 2500000);
		set("unit", "粒");
		set("only_do_effect", 1);
	}
}

int do_effect(object me)
{
        int effect;
        int neili;

        log_file("static/using", sprintf("%s(%s) eat 玄黄紫清丹 at %s.\n",
                 me->name(1), me->query("id"), ctime(time())));

        effect = 0;
        message_vision(HIW "$N" HIW "一仰脖，吞下了一颗" +
                       this_object()->name() + HIW "，只见$N"
                       HIW "浑身一颤，七窍都冒出白烟来。\n" NOR, me);

        me->add("combat_exp", 100000 + random(50000));
        me->improve_skill("force", 250000);
        me->improve_skill("parry", 250000);
        me->improve_skill("dodge", 250000);
        neili = me->query("max_neili") + 500;
        if (neili > me->query_neili_limit())
                neili = me->query_neili_limit();
        me->set("max_neili", neili);

        destruct(this_object());
	return 1;
}

