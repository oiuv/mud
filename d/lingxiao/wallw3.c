// wallw3.c

inherit ROOM;

void create()
{
        set("short", "城头");
        set("long", @LONG
“大漠孤烟直，长河落日圆”。也只有在这种绝域寒地，方
有此种豪迈奇景现世。日薄西山，余辉满世，在这寂静无声的大
漠之上，往往有烟气直升九霄，蔚为奇观。视野尽处，一道横贯
大漠的长河，遮掩住了红火的落日。天色愈暗，直到那最后一道
余辉逝去，短短一柱香的时间内，让人的灵魂，也为之震撼。 
LONG );
        set("outdoors", "lingxiao");
        set("no_clean_up", 0);

        set("exits", ([
                "east" : __DIR__"wallw2",
        ]));
        set("objects", ([
                __DIR__"npc/dizi" : 1,
        ])); 
        setup(); 
        replace_program(ROOM);
}

