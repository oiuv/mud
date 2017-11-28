//LUCAS 2000-6-18
// wallw1.c

inherit ROOM;

void create()
{
        set("short", "城头");
        set("long", @LONG
狂风吹雪，卷起千堆银屑。孤鸿翔空，拂乱万里云空。“平
地不见雪，白沙入黄云”，正是这种情况的真实写照。远处依稀
可见一两个在当地被称为‘海子’的湖泊，在狂风、白雪、烈日
的映照下，挂起点点鱼鳞之浪。
LONG );
        set("outdoors", "lingxiao");
        set("no_clean_up", 0);

        set("exits", ([
                "west" : __DIR__"wallw2",
                "eastdown"  : __DIR__"gate",
        ]));
        set("objects", ([
                __DIR__"npc/dizi" : 1,
        ])); 
        setup();
        replace_program(ROOM);
}

