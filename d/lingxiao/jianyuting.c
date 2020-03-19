inherit ROOM;

void create()
{
        set("short", "监狱小厅");
        set("long", @LONG
这里就是凌霄城的监狱入口。凌霄城的监狱专门用来关押犯
了门规的弟子，一些城中的作奸犯科，鸡鸣狗盗之徒也顺便收押
在此。凌霄向来一派所成，所以门规森严，倒也少有犯事者，但
这里是凌霄重地，防守自也严密。
LONG );
        set("exits", ([
                "west" : __DIR__"iceroad3",
                "down" : __DIR__"laolang",
        ]));
        set("objects", ([ 
                __DIR__"npc/yan" : 1,
                __DIR__"npc/dizi" : 3,
        ])); 
        setup(); 
}

int valid_leave(object me, string dir)
{
        object yan;

        if (dir != "down" ||
            ! objectp(yan = present("yan wanpeng", this_object())))
                return ::valid_leave(me, dir);

        return yan->permit_pass(me, dir);
}
