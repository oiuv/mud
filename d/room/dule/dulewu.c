// dulewu.c 独乐居小屋

//** inherit PRIVATE_ROOM;
inherit ROOM;                                   /* EXAMPLE */

void create()
{
	set("short", "小屋");             /* EXAMPLE */
//**    set("short", "ROOM_NAME小屋");
	set("long", @LONG
屋子不大，靠窗的地方摆了一张床，屋中一张桌，几只椅，非常简单。
恐怕只有甘于寂寞的人才住得了这种简朴的屋子。
LONG );

	set("default_long", "屋子不大，靠窗的地方摆了一张床，"   /**/
                            "屋中一张桌，几只椅，非常简单。"     /**/
                            "看来主人是一个甘于平淡寂寞的人。"); /**/
                                                                 /**/
	setup();

        set("exits", ([                         /* EXAMPLE */
                "south" : __DIR__"xiaoyuan",    /* EXAMPLE */
        ]));                                    /* EXAMPLE */
                                                /* EXAMPLE */
//**    set("KEY_DOOR", ([
//**            "exit" : "south",
//**            "room" : __DIR__"xiaoyuan",
//**    ]));
//**
//**    set("sleep_room", 1);
//**    set("loving_room", 1);
        set("no_fight", 1);
//**
//**    set("room_owner", "ROOM_OWNER");
//**    set("room_name", "ROOM_NAME");
//**    set("room_id", "ROOM_ID");
//**    set("room_position", "ROOM_POSITION");
}
