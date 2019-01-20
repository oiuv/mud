#include <ansi.h> 

inherit ITEM;
void setup()
{}

void init()
{
        add_action("do_du", "du");
        add_action("do_du", "study");      
}

void create()
{
        set_name(WHT "铁掌掌谱" NOR , ({ "tiezhang zhangpu", "zhangpu", "pu" }));
        set_weight(600);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "本");
                set("long", "这是一本落满灰尘的破书，纸质发黄，边缘处也已残缺不全了。\n");
                set("value", 1000);
                set("material", "paper");
        }
}

int do_du(string arg)
{
        object me = this_player();
        object where = environment(me);
//      object ob;
//      mapping skill;
        int level; 
        int neili_lost;

        if ( ! id(arg))
        return 0;

        if (where->query("pigging"))
        {
                write("你还是专心拱猪吧！\n");
                return 1;
        }

        if (me->is_busy())
        {
                write("你现在正忙着呢。\n");
                return 1;
        }

        if( me->is_fighting() )
        {
                write("你无法在战斗中专心下来研读新知！\n");
                return 1;
        }

        if ( ! id(arg))
        { 
                write("你要读什么？\n");
                return 1;
        }
       
        if( ! me->query_skill("literate", 1) )
        {
                write("你是个文盲，先学点文化(literate)吧。\n");
                return 1;
        }

        if( (int)me->query("jing") < 30 )
        {
                write("你现在过于疲倦，无法专心下来研读新知。\n");
                return 1;
        }

        if( me->query_skill("tie-zhang", 1) > 120)
        {
                write("你研读了一会儿，但是发现上面所说的对你而言都太浅显了，没有学到任何东西。\n");
                return 1;
        }

        if( me->query_skill("tie-zhang", 1) < 50)
        {
                write("你研读了一会儿，但是发现上面所说的对你而言都太深奥了，没有学到任何东西。\n");
                return 1;
        }

        if ( me->query_skill("tie-zhang", 1) > 100)
                neili_lost = 30;

   else if ( me->query_skill("tie-zhang", 1) > 60)
                neili_lost = 20;
      else
                neili_lost = 10;


        if( (int)me->query("neili") < neili_lost)
        {
                write("你内力不够，无法钻研这么高深的武功。\n");
                return 1;
        }

        level = me->query_skill("tie-zhang", 1);
        if( (int)me->query("combat_exp") < (int) level * level * level / 10 )
        {
                write("你的实战经验不足，再怎么读也没用。\n");
                return 1;
        }

        switch(random(3))
        {
          case 0:
                message("vision", me->name() + "翻出一本书在读。\n", environment(me), me);
                break;
          case 1:
                message("vision", me->name() + "一边读书，浑身骨骼一边发出咯咯的脆响。\n", environment(me), me);
                break;
          case 2:
                message("vision", me->name() + "的脸色时红时青，阴晴不定。\n", environment(me), me);
                break;
        }

        me->receive_damage("jing", 25);
        me->set("neili", (int)me->query("neili")-neili_lost);

        me->improve_skill("tie-zhang", (int)me->query("int") + 10);
        write("你研读《铁掌掌谱》，颇有心得。\n");
        return 1;
}
