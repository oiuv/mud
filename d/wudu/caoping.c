inherit ROOM;

void create()
{
        set("short", "卧龙岗上");
        set("long", @LONG
山顶上有一大片开阔地，蓝蓝的天上飘着几朵白云，脚下是绿油
油的草地，浅浅的刚好可以盖过脚面，散发着一种诱人的芳香舒服的
人直想躺在上面打滚。前面有几间简陋的竹舍。
LONG);
        set("outdoors", "wudujiao");

        set("exits", ([
                "south" : __DIR__"zhushe",
                "northdown" : __DIR__"shanlu3",
        ]));

        setup();
        //replace_program(ROOM);
}
