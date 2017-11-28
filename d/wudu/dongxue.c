inherit ROOM;
#include <ansi.h>

void create()
{
        set("short", "洞穴");
        set("long", @LONG
这里是洞壁高处的一个洞穴，地方小得只能容纳一个人存身。这
里黑洞洞的什么也看不见，只有洞旁的一株奇异的小草，叶面闪烁着
点点的磷光，显得鬼魅异常。
LONG );

        set("objects", ([
                  __DIR__"obj/duanchang": 1,
        ]));
              if (random(10) > 5) 
                      set("objects", ([ 
                               "/d/wudu/obj/tongpai" : 1, 
                      ])); 
    

        setup();
}

void init ()
{
        add_action("do_use", "use");
        add_action("do_fire","fire");
        add_action("do_fire","dian");
        add_action("do_insert","insert");
        add_action("do_climb","climb");
}

int do_use(string arg)
{
        object me;
        me = this_player();

        if ( !arg || arg == "" ) return 0;
        if ( !present("fire", me)) return 0;
        if ( arg == "fire" )
        {
                write( HIY "你点燃了火折，可是洞穴里实在太黑了，一支火折远不"
                       "够，看来要找支火把才行。\n\n" NOR);
                return 1;
        }
}

int do_fire (string arg)
{
        object me = this_player();

        if ( !arg || arg != "huo ba" )
                return notify_fail ("你想点燃什么？\n");

        if ( !present(arg, me))
                 return notify_fail("你身上没有这样东西。\n");

        message_vision (HIR "$N" HIR "“嚓”的一声点亮一支火把！\n\n" NOR, me);
        message_vision (HIY "刹那间四周被照得清清楚楚！\n" NOR, me);
        this_object()->recreate();
        me->set_temp("fire_huoba",1);
        remove_call_out ("precreate");
        call_out ("precreate",20,this_object());
        destruct(present(arg,me));
        return 1;
}

void precreate (object me)
{
        tell_room (me, WHT "光线忽的一暗，火把熄灭了，四周又变得一片漆黑！\n\n" NOR);
        me->delete_temp("fire_huoba");
        me->create();
}

int do_insert (string arg)
{
        object ob;
        object me = this_player();

        if ((int)me->query_temp("fire_huoba")< 1)
             return notify_fail("四周黑漆漆的，什么也看不见啊……\n");

        if ( !arg || arg != "tong pai")
             return notify_fail("你要插入什么？\n");

        if ( !present(arg, me))
             return notify_fail("你身上没有这样东西啊！\n");

       // if ((int)me->query_temp("fire_huoba")< 1)
       //      return notify_fail("四周黑漆漆的，什么也看不见啊？\n");

        message_vision (HIY "$N" HIY "试着将铜牌插入石壁上的小孔中！\n\n" NOR,me);
        message_vision (HIC "忽然一阵隆隆的剧烈震动，$N" HIC "只觉得一阵天旋地转！\n\n" NOR, me);
        destruct(present(arg,me));

        ob = load_object(__DIR__"mishi");
        ob = find_object(__DIR__"mishi");

        message("vision", HIR + me->query("name") + HIR "忽然从室顶缝隙中滑了进来。\n" NOR, ob);
        message_vision (HIR "$N" HIR "忽然觉得脚下一空，竟掉了下去！\n\n" NOR,me);
        me->delete_temp("fire_huoba");
        me->move(__DIR__"mishi");
        return 1;

}
int do_climb(string arg)
{
       
        object me = this_player();
        object ob;

        if( (!arg) ||!((arg == "岩壁") || (arg == "wall")))
             return notify_fail("你要爬什么？\n");
        message_vision(HIC "$N" HIC "小心翼翼的攀着岩壁上突出的石笋爬了下去。\n\n" NOR,me);

        ob = load_object(__DIR__"wandu3");
        ob = find_object(__DIR__"wandu3");

        message("vision", HIC + me->query("name") + HIC "从岩壁上爬了下来。\n" NOR, ob);
        me->move(__DIR__"wandu3");
        return 1;
}

void recreate ()
{
        set ("short", "洞穴");
        set ("long", @LONG
这是一个狭窄的洞穴，四周石壁湿漉漉的，长满了青苔。你仔细
观察一下四周的情况，发现洞内深处有一块石壁非常平整，象是有人
力的痕迹，正中间有一个扁扁的小孔，好象可以插入(insert)什么东
西试试。
LONG);

        setup();
}
