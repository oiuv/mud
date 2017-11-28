// Room: /d/huashan/sgyhole.c

inherit ROOM;
#include <ansi.h>

void create()
{
        set("short", "山洞");
        set("long", @LONG
这是一个毫不起眼的山洞，但是里面的石壁上却画满了五
岳剑派所有已经失传的精妙绝招。花岗岩石壁(wall)上很多小
人，全是用利器刻制，想见当初运力之人内力十分深厚。
LONG );
        set("exits", ([ /* sizeof() == 4 */
            "southup"   : __DIR__"sgyhole2",
            "north"     : __DIR__"sgyhole4",
        ]));
        set("item_desc", ([ 
            "wall" : @TEXT

       o    | o      o    \ o      o      o     <o     <o>
    --^|\    ^|^  --v|^    v|v    |/v   \|X|    \|      |
       /\     >\    /<      >\    /<      >\    /<      >\

       o>     o      o      o      o      o      o      o
       \ __   x     </     <|>    </>    <\>    <)>     |\__
      /<      >\    /<      >\    /<      >\     >>     L

TEXT
        ]));

        setup();
}
void init()
{
        add_action("do_mianbi", "mianbi");
}

int do_mianbi()
{
        object ob;
        int c_skill;

        ob = this_player();

        c_skill = (int)ob->query_skill("poyang-jian", 1);


        if (!ob->query("can_perform/poyang-jian/long"))
        {
                write("你觉得石壁上的内容对你而言过于深奥，一时难以体会。\n");
                return 1;
        }

        if (ob->query("real_perform/poyang-jian/long"))
        {
                write("你觉得石壁上的内容对你而言过于肤浅。\n");
                return 1;
        }

        if (ob->query("combat_exp") < 1000000)
        {
                write("你的实战经验不足，无法领悟石壁内容。\n");
                return 1; 
        }

        if (c_skill < 160)
        {
                write("你研究了半天，始终无法参悟透石壁上的内容。\n");
                return 1; 
        }

        if (ob->query("jing") < 80)
        {
                write("你精力不能集中，现在无法领悟石壁内容。\n",ob);
                return 1; 
        }
      
        if (random(15) != 1)
        {
        
                write("你面对着石壁趺坐静思，良久，对「天外玉龙」"
                               "这招似有所悟，但仍有许多不解之处。\n", ob);
                ob->start_bisy(2);
                return 1;
        }

        message_sort(HIW"\n$N" HIW"面对着石壁趺坐静思，猛然间一声长叹，诸"
                     "多凡尘旧事已涌上心头，$N" HIW "终于将「天外玉龙」"
                     "参悟出来，从此再无疑虑。\n", ob);

        if (ob->can_improve_skill("sword"))
                 ob->improve_skill("sword", 1500000);   
        if (ob->can_improve_skill("poyang-jian"))
                 ob->improve_skill("poyang-jian", 1500000);     
        if (ob->can_improve_skill("martial-cognize"))
                 ob->improve_skill("martial-cognize", 1500000);
    
        write(HIC "你学会了「天外玉龙」。\n" NOR);
        ob->set("real_perform/poyang-jian/long", 1);
        ob->receive_damage("jing", 75);
        ob->start_busy(2);
        return 1;
}
