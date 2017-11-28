// mishi.c
#include <room.h>

inherit ROOM;
int do_press();
int valid_leave();

void create()
{
       set("short","密室");
       set("long", @LONG
这是一间不大的房间，房间里摆着一排排的书架(shu jia)
和很多书(book)，在书架的两旁靠着几具死人的骸骨，有一具
的胸骨之中还插着一柄剑。
LONG
     );
        set("exits", ([
                "out" : __DIR__"neitang",
        ]));
        set("item_desc", ([
                "shu jia" :
        "书架上摆着各种各样的书。\n",
                "book" :
        "都是一些很平常的书，到处都可以见到。\n",
        ]) );
        set("objects", ([
                __DIR__"obj/tizi" : 1,
        ]));

        set("no_clean_up", 0);
        setup();
}

void init()
{
        add_action("do_jump", "jump");
}


int do_jump(string arg)
{
        object me;
        me = this_player();

        if( !arg || arg=="" )
                return 0;
        if( arg=="shu jia")
        {
            if (me->query_temp("marks/跳1") ) {
                if (me->query_skill("dodge",1)<100)
                    write("你试图跳上书架的顶端，但老是跳不上去。\n");
                else {
                    write("你纵身跃上了书架顶端。\n");
                    message("vision",
                             me->name() + "一纵身跃上了书架顶端。\n",
                             environment(me), ({me}) );
                    me->move(__DIR__"dingduan");
                    message("vision",
                             me->name() + "从下面跃了上来。\n",
                             environment(me), ({me}) );
                }
                return 1;
           }
        }
}

int valid_leave(object me, string dir)
{
        me->delete_temp("marks/跳1");
        return ::valid_leave(me, dir);
}

