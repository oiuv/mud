#include <ansi.h>; 
inherit ITEM;

void create()
{
        set_name(HIW "「九阴真经」" NOR, ({ "jiuyin zhenjing", "jiuyin", "zhenjing"}));
        set_weight(500);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "本");
                set("material", "paper");
                set("no_sell", 1);
                set("long", HIW "这是一本用薄纸写成的书，封皮上写有「九阴真经」四\n"
                                "字。书皮泛黄，看来已经保存很久了。真经中记载有催\n"
                                "心掌、九阴白骨爪、大伏魔拳、银龙鞭法、易筋锻骨和\n"
                                "蛇行狸翻等绝技，你可以试着读读(read)看。\n" NOR, );
        }
}

void init()
{
        add_action("do_du", "yanjiu");
        add_action("do_du", "research");
}

int do_du(string arg)
{
        object me = this_player();
        object where = environment(me);
        object ob;
        string skill, book;
        int lv;

        if(! arg)
        {
                write("研究九阴真经的指令格式：\n"
                      "research|yanjiu <技能> from <九阴真经>\n");
                return 1;
        }
        if(arg == "yijin-duangu" || arg == "shexing-lifan"  
        || arg == "cuixin-zhang" || arg == "jiuyin-baiguzhao" 
        || arg == "jiuyin zhenjing" || arg == "zhenjing" )
        {
                write("研究九阴真经的指令格式：\n"
                      "research|yanjiu <技能> from <九阴真经>\n");
                return 1;
        }

        if (sscanf(arg, "%s from %s", skill, book) != 2)
        return 0;
        if( me->is_busy())
        {
                write("你现在正忙着呢。\n");
                return 1;
        }
        if( me->is_fighting())
        {
                write("你无法在战斗中专心下来研读新知！\n");
                return 1;
        }
        if( ! me->query_skill("literate", 1) )
        {
                write("你是个文盲，先学点文化(literate)吧。\n");
                return 1;
        }
        if (! id(book))
        {
                write("这里没有这本书。\n");
                return 1;
        }
        if ( skill != "yijin-duangu" && skill != "shexing-lifan"  
          && skill != "cuixin-zhang" && skill != "jiuyin-baiguzhao" )
        {
                write(HIW "你可以从九阴真经里研究到易筋锻骨（yijin-duangu），蛇行狸翻（shexing-lifan），\n"
                          "催心掌（cuixin-zhang）以及九阴白骨爪（jiuyin-baiguzhao）。\n\n" NOR,);
                return 1;
        }
        if( me->query_skill("sanscrit", 1) < 199)
        {
                write("你的梵文水平太低，无法看懂真经里所记载的内容。\n");        
                return 1;
        }
        if( (int)me->query("combat_exp") < 500000 )
        {
                write("你的实战经验不足，再怎么读也没用。\n");
                return 1;
        }
        if( (int)me->query("jing") < 101 || (int)me->query("qi") < 101 )
        {
                write("你现在过于疲倦，无法专心下来研读新知。\n");
                return 1;
        }
        if ( skill == "yijin-duangu" )
        {
                lv = me->query_skill("yijin-duangu", 1);
                if( (int)me->query("combat_exp") < (int)lv * lv * lv/10 ) {
                        write("你的实战经验不足，再怎么读也没用。\n");
                        return 1;
                }
                if( lv > 199) {
                        write("你研读了一会儿，但是发现上面所说的对你而言都太浅了，没有学到任何东西。\n");
                        return 1;
                }
                message("vision", me->name() + "正专心地研读九阴真经。\n", environment(me), me);
                me->receive_damage("qi", 100);
                me->receive_damage("jing", 100);
                me->improve_skill("yijin-duangu", me->query("int")/4+1);
                write("你仔细研读九阴真经，对真经里所记载的易筋锻骨颇有心得。\n");
                return 1;
        }
        if ( skill == "shexing-lifan" )
        {
                lv = me->query_skill("shexing-lifan", 1);
                if( (int)me->query("combat_exp") < (int)lv * lv * lv/10 ) {
                        write("你的实战经验不足，再怎么读也没用。\n");
                        return 1;
                }
                if( lv > 199) {
                        write("你研读了一会儿，但是发现上面所说的对你而言都太浅了，没有学到任何东西。\n");
                        return 1;
                }
                message("vision", me->name() + "正专心地研读九阴真经。\n", environment(me), me);
                me->receive_damage("qi", 100);
                me->receive_damage("jing", 100);
                me->improve_skill("shexing-lifan", me->query("int")/4+1);
                write("你仔细研读九阴真经，对真经里所记载的蛇行狸翻轻功颇有心得。\n");
                return 1;
        }
        if ( skill == "cuixin-zhang" )
        {
                lv = me->query_skill("cuixin-zhang", 1);
                if( (int)me->query("combat_exp") < (int)lv * lv * lv/10 ) {
                        write("你的实战经验不足，再怎么读也没用。\n");
                        return 1;
                }
                if( lv > 199) {
                        write("你研读了一会儿，但是发现上面所说的对你而言都太浅了，没有学到任何东西。\n");
                        return 1;
                }
                message("vision", me->name() + "正专心地研读九阴真经。\n", environment(me), me);
                me->receive_damage("qi", 100);
                me->receive_damage("jing", 100);
                me->improve_skill("cuixin-zhang", me->query("int")/4+1);
                write("你仔细研读九阴真经，对真经里所记载的催心掌颇有心得。\n");
                return 1;
        }
        if ( skill == "jiuyin-baiguzhao" )
        {
                lv = me->query_skill("jiuyin-baiguzhao", 1);
                if( (int)me->query("combat_exp") < (int)lv * lv * lv/10 ) {
                        write("你的实战经验不足，再怎么读也没用。\n");
                        return 1;
                }
                if( lv > 199) {
                        write("你研读了一会儿，但是发现上面所说的对你而言都太浅了，没有学到任何东西。\n");
                        return 1;
                }
                message("vision", me->name() + "正专心地研读九阴真经。\n", environment(me), me);
                me->receive_damage("qi", 100);
                me->receive_damage("jing", 100);
                me->improve_skill("jiuyin-baiguzhao", me->query("int")/4+1);
                write("你仔细研读九阴真经，对真经里所记载的九阴白骨爪颇有心得。\n");
                return 1;
        }
}


