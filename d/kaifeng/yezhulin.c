inherit ROOM;

void create()
{
	set ("short", "野猪林");
	set ("long", @LONG
自从不久前这林子中出了野猪之后，这片松林就少人来开
封境内，谈猪色边。只有为生活所迫的樵子还在林边打些野柴。
自认武艺高强的图个路近，也从此过。穿过此地便是华山。
LONG);

	set("outdoors", "kaifeng");
	set("exits", ([
        	"northeast" : __DIR__"dadao2",
        	"west" : "/d/huashan/path1",
	]));
        set("objects", ([
                "/clone/quarry/zhu" : 2,
                "/clone/quarry/zhu2" : 2,
        ]));
	setup();
	replace_program(ROOM);
}
