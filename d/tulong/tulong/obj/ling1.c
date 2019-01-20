#include <weapon.h>
#include <ansi.h>

inherit SWORD;

void init()
{
        add_action("do_du", "yanjiu");
        add_action("do_du", "research");
}

void create()
{
        set_name(CYN "圣火令" NOR, ({ "shenghuo ling", "shenghuo", "ling" }) );
        set_weight(1000);
        if( clonep() )
                set_default_object(__FILE__);
        else
        {
                set("unit", "把");
                set("value", 10000);
                set("material", "steel");
                set("no_sell", "他奶奶的，这是什么玩意？");
                set("long", CYN "这是一柄两尺来长的黑牌，非金非铁。质地坚硬无比，\n"
                                "似透明，令中隐隐似有火焰飞腾，实则是令质映光，颜\n"
                                "色变幻。令上刻得有不少波斯文字。 \n" NOR);
                set("wield_msg", CYN "$N“唰”的一声，从腰间抽出一片黑黝的铁牌握在手中。\n");
                set("unwield_msg", CYN "$N将圣火令插回腰间。\n" NOR);
        }
        init_sword(100);
        setup();
}

int do_du(string arg)
{
        object me = this_player();
//      object where = environment(me);
//      object ob;
//      mapping skill;
        int pxlevel; 

        if (!(arg=="shenghuo ling" || arg == "shenghuo" || arg == "ling" ))
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
        if( me->query_skill("sanscrit", 1) < 199){
                write("你的梵文水平太低，无法看懂圣火令里所记载的内容。\n");
                return 1;
        }

        message("vision", me->name() + "正专心地研读圣火令。\n", environment(me), me);

        if( (int)me->query("jing") < 80 ) {
                write("你现在过于疲倦，无法专心下来研读新知。\n");
                return 1;
        }
        if( (int)me->query("qi") < 80 ) {
                write("你现在过于疲倦，无法专心下来研读新知。\n");
                return 1;
        }
        pxlevel = me->query_skill("shenghuo-ling", 1);

        if( (int)me->query("combat_exp") < 100000 ) {
                write("你的实战经验不足，再怎么读也没用。\n");
                return 1;
        }
        if( (int)me->query("combat_exp") < (int)pxlevel*pxlevel*pxlevel/10 ) {
                write("你的实战经验不足，再怎么读也没用。\n");
                return 1;
        }
        if( me->query_skill("shenghuo-ling", 1) > 49){
                write("你研读了一会儿，但是发现圣火令上所记载的对你而言都太浅了，没有学到任何东西。\n");
                return 1;
        }
        me->receive_damage("qi", 50);
        me->receive_damage("jing", 50);
        me->improve_skill("shenghuo-ling", (int)me->query_skill("literate", 1)/5+1);
        write("你研读圣火令，颇有心得。\n");
        return 1;
}
