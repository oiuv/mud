// Room: /d/shaolin/houdian.c
// Date: YZC 96/01/19

inherit ROOM;

void create()
{
	set("short", "后殿");
	set("long", @LONG
后殿规模不大。两边都是水磨石壁，镂刻着十八罗汉的肖像
及佛谒，正中有一口水井，水面净如明镜，纯若菩提，名曰佛心
乃寺内有名的清水井。东西面各有个门洞，通向两侧长长的走廊。
LONG );
	set("exits", ([
		"west" : __DIR__"zoulang2",
		"east" : __DIR__"zoulang3",
		"south" : __DIR__"guangchang4",
		"north" : __DIR__"wuchang",
	]));
	set("valid_startroom",1);
	set("resource/water",1);
	set("objects",([
		CLASS_D("shaolin") + "/hui-ru" : 1,
                CLASS_D("shaolin") + "/kong-jian" : 1,
		__DIR__"npc/seng-bing3" : 2,
	]));
	setup();
}

int valid_leave(object me, string dir)
{
        object kj;

        if (dir != "east" &&
            dir != "west" &&
            dir != "north" ||
            ! objectp(kj = present("kong jian", this_object())))
                return ::valid_leave(me, dir);

        return kj->permit_pass(me, dir);
}
