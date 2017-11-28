inherit ROOM;

void create()
{
	set("short", "青石小巷");
	set("long", @LONG
这里一条青石小路，路面用青石板铺成，刚刚下过雨，路面很是干净，
小巷内静悄悄的，只能听见自己的脚步声，偶尔风吹动树枝发出沙沙的响
声。
LONG);
        set("outdoors", "luoyang");
        set("no_clean_up", 0);
        set("exits", ([
  		"east" : __DIR__"xiaoxiang2",
  		"west" : __DIR__"nroad4",
	]));
        set("objects", ([
                "/d/kaifeng/npc/woman" : 1,
        ]));
	setup();
	replace_program(ROOM);
}
