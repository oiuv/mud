inherit ROOM;

void create()
{
        set("short", "石阶");
        set("long",@LONG
你走在一条坚实的石阶上，不时地有进香客从你的身边走
过。一边是峭壁，一边是悬崖，抬头隐约可见笼罩在云雾中的
天柱峰，听着流水淙淙，令人心旷神怡。
LONG);
        set("objects", ([
                __DIR__"npc/guest" : 2,
        ]));
        set("outdoors", "wudang");
        set("exits", ([
                "northdown"  : __DIR__"xuanyuegate",
                "southup"    : __DIR__"yuzhengong",
        ]));
        setup();
        replace_program(ROOM);
}
