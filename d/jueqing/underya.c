#include <ansi.h>

inherit ROOM;

int out_water(object me);

void create()
{
        set("short", "绝情谷底");
        set("long", @LONG
这里便是绝情谷底，情景一瞥之间，四下削壁环列， 宛似
身处一口大井之底， 常言道：“坐井观天”，但坐在此处，望
上去尽是白云浓雾。不远处是一寒潭(tan)，潭中弥漫着阵阵寒
气。 寒潭西侧有几块大石(stone)。 四下一望，峭壁上垂一根
长藤(teng)， 看来可以借这跟树藤攀上悬崖。

LONG);
        set("item_desc",([
                "tan"    : HIC "寒潭看去平静如镜，阵阵寒气从中透出。\n" NOR,
                "stone"  : NOR + WHT "石头有半人多高，看似非常沉重。\n" NOR,
                "teng"   : NOR + YEL "这根树藤看上去很结实，可作攀爬之用。\n" NOR,
 
        ]));
        set("no_clean_up", 0);

        setup();
}

void init()
{       
        add_action("do_jump", ({ "tiao", "jump" }));
        add_action("do_climb", ({ "climb", "pa" }));
        add_action("do_bao", ({ "bao" }));
}

int do_bao(string arg)
{
        object me = this_player();

        if (! arg || arg != "stone")
                return notify_fail("你要抱什么？\n");

        if (me->is_busy())
                return notify_fail("你现在正忙着呢！\n");

        if (me->is_fighting())
                return notify_fail("你还是先把你面前这个家伙解决了再说。\n");     

        if (me->query_temp("marks/抱"))
                return notify_fail("你已经抱了一块石头了。\n"); 

        write(HIC "你将大石抱起，顿感异常沉重。\n" NOR);
        
        // 将石头抱住才可沉入寒潭中
        me->set_temp("marks/抱", 1);

        return 1;
}

int do_climb(string arg)
{
        object me = this_player();
        object ob;


        if (! arg || arg != "teng")
                return notify_fail("你要做什么？\n");

        if (me->is_busy())
                return notify_fail("你现在正忙着呢！\n");

        if (me->is_fighting())
                return notify_fail("你还是先把你面前这个家伙解决了再说。\n");
        
        write(HIG "\n你拉着树藤向上爬去…\n" NOR);
        write(HIC "\n爬了许久，你感觉疲惫之极，但终于达到了山峰。\n\n" NOR);

        if (! ob = find_object(__DIR__"jueqing"))
               ob = load_object(__DIR__"jueqing");

        me->move(ob);
       
        return 1;

}
int do_jump(string arg)
{
        object me = this_player();
        object ob;


        if (! arg || arg != "tan")
                return notify_fail("你要往哪儿跳？\n");

        if (me->is_busy())
                return notify_fail("你现在正忙着呢！\n");

        if (me->is_fighting())
                return notify_fail("你还是先把你面前这个家伙解决了再说。\n");
       
        if (me->query("tiao"))
                return 1;

        if (! me->query_temp("marks/抱"))
        {                    
                write(HIW "你长吸一口气，纵身入潭，直往深处潜去，那潭底越深越"
                      "寒，潜\n了一会，四周蓝森森的都是玄冰。由于深处浮力太强"
                      "，你用力冲\n了数次，也不过再潜下数丈，始终无法到底……\n" NOR);

                call_out("out_water", 6, me);
                me->set("tiao", 1);

                return 1;
        }
         
        // 抱住大石，能够潜入潭底
        write(HIG "你纵身入潭，由于抱有大石头，身体急沉而下，猛地里眼前一\n"
                  "亮，你心念一动，忙向光亮处游去，只觉一股急流卷着你的身\n"
                  "子冲了过去，光亮处竟是一洞。你抛下大石，手脚齐划，那洞\n"
                  "内却是一道斜斜向上的冰窖。你顺势而上，过不多时， “波”\n"
                  "的一响，跃出了水面。\n" NOR);

        if (! ob = find_object(__DIR__"underya2"))
               ob = load_object(__DIR__"underya2");

        me->move(ob);
        me->delete_temp("marks/抱");
        me->delete("tiao");
       
        return 1;

}

int out_water(object me)
{      
       write(HIY "此时你气息渐促，只好回到岸边。\n" NOR);
       me->move(__DIR__"underya");
       me->delete("tiao");
       return 1;
}