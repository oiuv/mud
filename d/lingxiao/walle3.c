//LUCAS 2000-6-18
// walle2.c

inherit ROOM;

void create()
{
        set("short", "城头");
        set("long", @LONG
远山渺渺，冷风萧萧。试拂铁衣，只见衣色似雪，在这凌霄
之处，惟有雨雪连绵，以陪弋人。大漠苍苍，远空一鹰高翔，振
翅直飞九霄，忽而又直冲而下，翱翔九天，瞬间无踪，只有白云
千载，仍在这座孤城上悠悠飘荡。
LONG );
        set("outdoors", "lingxiao");
        set("no_clean_up", 0);

        set("exits", ([
                "west" : __DIR__"walle2",
        ]));
        set("objects", ([
                __DIR__"npc/dizi" : 1,
        ])); 
        setup();
        replace_program(ROOM);
}

