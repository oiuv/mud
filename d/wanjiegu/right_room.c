// Room: /t/wanjiegu/right_room.c

inherit ROOM;

void create()
{
        set("short", "右厢房");
        set("long", @LONG
这是一间普通的房间，里面放着一些日常用品，墙角落里堆着
一堆药草，是钟谷主采集而来，日后要用它制造各种药物。
LONG
        );
        set("exits", ([ /* sizeof() == 2 */
            "west" : __DIR__"hall",
            "north" : __DIR__"drug_room",
        ]));

        set("objects", ([
            __DIR__"npc/fuer" : 1,
            __DIR__"obj/cao" : 1,
        ]));

        set("no_clean_up", 0);

        setup();
}

void reset()
{
        object          *inv;
        object          container, item;
        int             i;

        ::reset();
        container = present("cao", this_object());
        inv = all_inventory(container);
        if( sizeof(inv) != 1) {
                for(i=sizeof(inv)-1; i>=0; i--) destruct(inv[i]);
                item = new(__DIR__"obj/flower");
                if(random(2)==1 )
                    item->move(container);
        }
}

