inherit ROOM;

void create()
{
        set("short", "猢狲愁");
	set("long", @LONG
前面又是一处十分陡峭的山岭，上面有四只铁猿，盘踞台
畔，据说以前从华山水帘洞出来的猿猴，每到这里就要返回去，
连它们也感到难于超越，此岭因而得名。
LONG);
        set("exits", ([
                "northdown" : __DIR__"laojun",
                "southup"   : __DIR__"shangtianti",
        ]));
        set("objects", ([
                "/clone/quarry/hou" : 2,
        ]));
        set("no_clean_up", 0);
        set("outdoors", "huashan" );

        setup();
        replace_program(ROOM);
}
 
