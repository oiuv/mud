// xuanhuang.c 玄黄紫箐丹

#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(HIM "玄黄紫箐丹" NOR, ({ "xuanhuang dan", "xuanhuang", "dan" }) );
        set_weight(300);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("long", HIM "一颗紫中泛黄的精致奇丹，具有着神话般的功效，传\n"
                                "说吃了之后能平增数十年的功力，乃是练武之人梦寐\n"
                                "以求的神丹妙药。\n" NOR);
                set("value", 100000);
                set("unit", "颗");
                set("only_do_effect", 1);
        }
}

int do_effect(object me)
{
        string mapsk;
        int effect;
//      int neili;

        log_file("static/using", sprintf("%s(%s) eat 玄黄紫箐丹 at %s.\n",
                 me->name(1), me->query("id"), ctime(time())));

        effect = 0;

        if (me->query("skybook/item/xuanhuang"))
        {
	        message_vision(HIR "$N" HIR "一仰脖，吞下了一颗玄黄紫箐丹，却听$P"
                               HIR "一声尖哮，喷出一口鲜血，仰面便倒。\n" NOR, me);

                me->set_temp("die_reason", "贪吃玄黄紫箐丹，结果弄得全身筋脉尽断"
                                           "而亡");
                me->die(); 
        } else
	{
        	message_vision(HIW "$N" HIW "一仰脖，吞下了一颗玄黄紫箐丹，只见$P"
                               HIW "浑身一颤，七窍都冒出白烟来。\n" NOR, me);

        	me->add("combat_exp", 100000 + random(50000));
        	me->add("potential", 10000);

        	mapsk = me->query_skill_mapped("force");
        	if (me->can_improve_skill("force"))
                	me->improve_skill("force", 1500000);
        	if (stringp(mapsk) && me->can_improve_skill(mapsk))
                	me->improve_skill(mapsk, 1500000);

        	mapsk = me->query_skill_mapped("parry");
        	if (me->can_improve_skill("parry"))
                	me->improve_skill("parry", 1500000);
        	if (stringp(mapsk) && me->can_improve_skill(mapsk))
                	me->improve_skill(mapsk, 1500000);

        	mapsk = me->query_skill_mapped("dodge");
        	if (me->can_improve_skill("dodge"))
                	me->improve_skill("dodge", 1500000);
        	if (stringp(mapsk) && me->can_improve_skill(mapsk))
                	me->improve_skill(mapsk, 1500000);

        	me->improve_neili(500);
        	me->set("skybook/item/xuanhuang", 1);
	}
        destruct(this_object());
        return 1;
}

int query_autoload()
{
        return 1;
}