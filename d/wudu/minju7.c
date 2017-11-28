inherit ROOM;

void create()
{
        set("short", "学堂");
        set("long", @LONG
这里是一座简陋的学堂，似乎是用祠堂改成。正中供桌(zhuo)上
还供着一些牌位，上面落满了灰尘。几个八、九岁的农家小孩正跟着
先生在念书。 
LONG);

        set("exits", ([
                "west" : __DIR__"cun7",
        ]));
        set("objects", ([
                __DIR__"npc/xuetong": 3,
                __DIR__"npc/xiansheng": 1,
        ]));
         set("item_desc", ([
                "zhuo": "一个陈旧的供桌，上面搭着黑糊糊的台布一直垂到地面。\n"
        ]) );

        setup();
}

void init()
{
        add_action("do_enter", "enter");
}

int do_enter(string arg)
{
        object me;
        me = this_player();

        if( !arg || arg == "" ) return 0;
        if( arg=="zhuo" )
        {
                message("vision", me->name() + "一弯腰往供桌下面钻了进去。\n",
                environment(me), ({me}) );
                me->move(__DIR__"minju9");
                message("vision", me->name() + "从外面钻了进来。\n",
                environment(me), ({me}) );
                return 1;
        }
}       
