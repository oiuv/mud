#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(HIW "脑白金" NOR, ({ "nao baijin", "nao", "baijin" }) );
        set_weight(300);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIW "上面写着「" HIY "今年我家不收礼，收礼只"
                            "收脑白金" HIW "」看样子是高级货。\n" NOR);
                set("value", 500000);
                set("unit", "盒");
                set("only_do_effect", 1);
        }
}

int do_effect(object me)
{
        string mapsk;
        int effect;
        int neili;

        log_file("static/using", sprintf("%s(%s) eat 脑白金 at %s.\n",
                 me->name(1), me->query("id"), ctime(time())));

        effect = 0;

       	message_vision(HIW "$N" HIW "哈哈一笑，将一整盒脑白金连同"
                       "盒子一块吞下肚去。\n" NOR, me);

       	me->add("combat_exp", 100000);
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

       	me->improve_neili(300);
       	me->improve_jingli(300);
        me->add("magic_points", 500);
        destruct(this_object());
        return 1;
}
