//ROOM: /d/yanziwu/canheju.c

inherit ROOM;

void create()
{
        set("short", "参合居");
        set("long",@LONG
这是慕容世家首脑人物日常起居之地，布置得华丽中不乏
清雅，平实中透着高贵。楠木方桌，大太师椅，以及墙上的字
画都透着一股非凡之气。
LONG  );
        set("valid_startroom", 1);
        set("no_sleep_room",1);

        set("exits", ([
            "west" : __DIR__"qiushuan",
            "east" : __DIR__"zuijing",
            "north": __DIR__"yimen",
            "south": __DIR__"shuwu",
        ]));

	set("objects", ([
		CLASS_D("murong") + "/murongbo" : 1,
	]));
        setup();
	"/clone/board/murong_b"->foo();
}
