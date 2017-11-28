// Room: /d/fuzhou/yongquan.c
// Date: May 12, 98  Java

inherit ROOM;

void create()
{
	set("short", "涌泉寺");
	set("long", @LONG
涌泉寺为闽中第一丛林。构筑宏伟，气势磅礴，工艺精
巧，冠绝一时。寺东胜境灵源深处，悬崖峭壁，峥嵘奇巧，
古树参天，宁静幽雅，其中千载碑林，多朱熹、蔡襄遗墨。
寺北绝顶峰，远望东海烟波，近瞰闽江流带，福州平原一派
田园风光尽收眼底。
LONG );
	set("exits", ([
                "south"    : __DIR__"gushan",
	]));
	set("objects", ([
                "/d/hangzhou/npc/seng" : 1,
	]));
	set("outdoors", "fuzhou");
	setup();
	replace_program(ROOM);
}

