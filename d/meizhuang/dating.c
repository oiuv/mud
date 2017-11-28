// dating.c
inherit ROOM;

void create()
{
        set("short", "四雅清风");
        set("long", @LONG
你已经到了梅庄的大厅门口，门内的匾额(bian)龙飞凤舞的写着
“四雅清风”四个大字，笔法娟秀中透着挺拔，不失为一笔好字。透
过后门，你看到里面一尘不染，一张石桌和几个石凳都安放得整整齐
齐。
LONG
        );
        set("item_desc", ([ /* sizeof() == 1 */
            "bian" : "这块匾已经很陈旧了，看起来摇摇晃晃的，似乎不大结实。\n",
        ]));
        set("exits", ([ /* sizeof() == 2 */
            "north" : __DIR__"keting",
            "south" : __DIR__"tianjing",
        ]));
        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}

