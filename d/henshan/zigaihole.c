#include <ansi.h>

inherit ROOM;
string look_keng();
string look_desk();

#define ZHUJIAN    "/d/henshan/obj/zigai-book"

void create()
{
        set("short", "紫盖仙洞");
        set("long", @LONG
这里便是紫盖仙洞。听这里的人说的由于这里处于紫盖峰
下，峰上融化的雪水便经过山涧汇如紫盖仙洞中，但是这里却
一点水也没有，耳边却传来来淙淙的水流声，你才发现雪水并
不是汇直接流入洞中，而是从洞壁上顺势向下流，经过一个较
深的低洼地带，积蓄起来，水满则溢，便形成了水莲洞外的飞
瀑。往光照来的的地方看去，已没有路可走，数丈远处便是悬
崖，原来这个洞竟生于一个峭壁之上。只见不远处摆着一个石
桌(desk)，显然这里曾经有人来过。
LONG);
        
        set("item_desc",([
               "desk" : ( :look_desk: ),
               "keng" : ( :look_keng: ),
        ]));
        
        set("exits",([
                "north" : __DIR__"xuanya",
        ]));

        setup();

}


void init()
{       
        add_action("do_move", "move");
        add_action("do_pick", "pick");
}


int do_move(string arg)
{               
        object here;

        if (! here = find_object(__DIR__"zigaihole"))
                here = load_object(__DIR__"zigaihole");

        if (! arg || (arg != "desk" && arg != "石桌"))
                return notify_fail("你想移什么？\n");
       
        if (here->query_temp("marks/移"))
        {
                write(HIG "\n你用力一推，将石桌移回了原处。\n\n" NOR);
                here->delete_temp("marks/移");
                return 1;
        }
        
        
        write(HIC "\n你用力一推，石桌下面竟露出一个坑(keng)来。\n\n"NOR);

        here->set_temp("marks/移", 1);
        return 1;
}

int do_pick(string arg)
{
        object here, book, me;

        me = this_player();

        if (! here = find_object(__DIR__"zigaihole"))
                here = load_object(__DIR__"zigaihole");

        if (! arg || (arg != "book"))
                return notify_fail("你要拿什么？\n");
        
        if (here->query_temp("marks/拿") || ! here->query_temp("marks/移"))
                return notify_fail("你要拿什么？\n");

        book = find_object(ZHUJIAN);

        if (! book) book = load_object(ZHUJIAN);

        if (! environment(book))
        {
                book->move(me, 1);
                message_vision(HIC "$N" HIC "从坑中将" + book->query("name") +
                               HIC "拿了出来。\n" NOR, me);
                return 1;
        } else
                return notify_fail(YEL "这里面什么也没有。\n" NOR);
        return 1;
}

string look_desk()
{  
       object here;
        
        if (! here = find_object(__DIR__"zigaihole"))
                here = load_object(__DIR__"zigaihole");

        if (here->query_temp("marks/移"))
                return WHT "\n石桌像是已被人推开，下面露出一个坑(keng)来。\n";
        else
   
                return WHT "\n一张石桌，上面已布满了灰尘。\n";

       
}

string look_keng()
{
        object here, book;

        book = find_object(ZHUJIAN);
        
        if (! here = find_object(__DIR__"zigaihole"))
                here = load_object(__DIR__"zigaihole");

        if (! here->query_temp("marks/移"))
                return "你要看什么？\n\n";

        if (! book) book = load_object(ZHUJIAN);

        if (environment(book))
                return HIY "\n这个坑中像是藏东西的，但里面空空如也，显然里面的东西已\n"
                           "被人拿走了。\n" NOR;

        return HIY "\n只见里面放着一本(book)，你忍不住想拿(pick)来看看。\n" NOR;
           
}

void reset()
{
        object here;
        
        if (! here = find_object(__DIR__"zigaihole"))
                here = load_object(__DIR__"zigaihole");

        ::reset();

        here->delete_temp("marks/移");
        here->delete_temp("marks/拿");

        return ;

}

