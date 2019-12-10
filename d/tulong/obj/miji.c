inherit ITEM;
inherit F_UNIQUE;
#include <ansi.h>

void setup()
{}
void init()
{
        add_action("do_du", "du");
        add_action("do_du", "study");
}
void create()
{
        set_name(CYN "降龙十八掌秘笈" NOR, ({ "xianglong miji", "book", "miji"}));
        set_weight(500);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "本");
                set("material", "paper");
                set("no_sell", 1);
                set("long",
        "乃大侠郭靖所编写，记载了丐帮的绝学降龙十八掌。\n"
        "为武林至高无上的武学。\n", );
        }
}

int do_du(string arg)
{
        object me = this_player();
//      object where = environment(me);
//      object ob;
//      mapping skill;
        int pxlevel;

        if (!(arg=="xianglong miji" || arg == "book" || arg == "miji" ))
        return 0;
        if (me->is_busy()) {
                write("你现在正忙着呢。\n");
                return 1;
        }
        if( me->is_fighting() ) {
                write("你无法在战斗中专心下来研读新知！\n");
                return 1;
        }
        if (!id(arg)) {
                write("你要读什么？\n");
                return 1;
        }
        if( !me->query_skill("literate", 1) ){
                write("你是个文盲，先学点文化(literate)吧。\n");
                return 1;
        }

        message("vision", me->name() + "正专心地研读降龙十八掌秘笈。\n", environment(me), me);
        if( (int)me->query("jing") < 80 ) {
                write("你现在过于疲倦，无法专心下来研读新知。\n");
                return 1;
        }
        if( (int)me->query("qi") < 80 ) {
                write("你现在过于疲倦，无法专心下来研读新知。\n");
                return 1;
        }
        pxlevel = me->query_skill("dragon-strike", 1);
        if( (int)me->query("combat_exp") < 100000 ) {
                write("你的实战经验不足，无法看懂降龙十八掌秘笈中的内容。\n");
                return 1;
        }
        if( (int)me->query("combat_exp") < (int)pxlevel*pxlevel*pxlevel/10 ) {
                write("你的实战经验不足，无法看懂降龙十八掌秘笈中的内容。\n");
                return 1;
        }
        if( me->query_skill("dragon-strike", 1) > 249){
                write("你研读了一会儿，但是发现秘笈中的内容对你而言都太浅了，没有学到任何东西。\n");
                return 1;
        }
        if( me->query_skill("dragon-strike", 1) < 80){
                write("你研读了一会儿，但是发现秘笈中的内容深奥无比，没有学到任何东西。\n");
                return 1;
        }
        me->receive_damage("qi", 50);
        me->receive_damage("jing", 50);
        me->improve_skill("dragon-strike", (int)me->query_skill("literate", 1)/5+1);
        write("你仔细研读降龙十八掌秘笈，颇有心得。\n");
        return 1;
}
