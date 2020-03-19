inherit ROOM;

void create()
{
        set("short", "冰雪轩");
        set("long", @LONG
这里是凌霄城里最大的酒楼冰雪轩，同时也是凌霄城的名迹
之一。大凡过往旅客，不管是贩夫走卒，还是文人墨客，迁客骚
人，都要到此一醉。当年谢烟客独闯凌霄城，在此狂饮十八坛烈
酒之后，杀入凌霄内城。从此，凌霄城冰雪轩的大名，便是名闻
四海。
LONG);
        set("exits", ([
                "east" : __DIR__"iceroad1",
        ]));
        set("objects", ([
                "/d/city/npc/xiaoer2" : 1,
                __DIR__"npc/dizi" : 2,
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}

