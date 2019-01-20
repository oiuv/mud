// neitang.c
#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "偏房"); 
        set("long", @LONG
这是一间没有任何东西的房子，四壁空荡荡的，好象是一间刚修
好的，还没有来得及进行装饰的房间，正中的墙上画着一幅壁画，相
当的醒目，画着九天十万神魔歃血为盟，十万滴魔血化做了一只鲜红
的鹦鹉，鹦鹉的眼睛(eye)竟然是用非常罕见的朱雀石做成的。
LONG
        );
        set("exits", ([ /* sizeof() == 1 */
            "east" : __DIR__"senlin1",
        ]));

        set("no_clean_up", 0);
        set("item_desc", ([
            "eye": "一块邪恶的朱雀石，发出耀眼的红光。\n"
        ]) ); 
        setup();
}
void init()
{
        add_action("do_push", "push");
}
int do_push(string arg)
{
//      string dir;
        object me=this_player();

        if( !arg || arg=="" ) {write("你想推什么？\n");return 1;}

        if( arg=="eye" ) {
                write("你使劲推了一下鹦鹉的眼睛，墙壁悄然旋开。\n");
                if((int)me->query_skill("force",1)>=100)
                {write("顺着墙壁旋开的夹缝，你进到里面的密室。\n");
                me->move(__DIR__"mishi");

                 return 1;}
                write("你试着推了一下鹦鹉的眼睛，但什么都没有发生。\n");

                me->add("jing",-10);
                me->add("qi",-10);


                return 1;

                 }
}
