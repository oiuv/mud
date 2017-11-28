inherit ROOM;

void create()
{
        set("short", "玉皇阁二层");
        set("long", @LONG
阁楼中打扫得还算干净，看来道士们对于三清虽然不大在
意，对玉皇还是挺尊重的。此地供奉的是尊汉白玉雕玉皇大帝
像，纹理细腻，推开窗栏，还能看到繁华的开封街景。
LONG);
        set("objects", ([
  		__DIR__"npc/obj/yudixiang" : 1,
	]));
        set("no_clean_up", 0);
        set("exits", ([
  		"down" : __DIR__"yuhuang",
	]));

        setup();
        replace_program(ROOM);
}
