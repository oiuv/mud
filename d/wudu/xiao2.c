inherit ROOM;

void create()
{
        set("short", "江边小路");
        set("long", @LONG
这里是桃花江边的一条泥土小路，一旁就是清澈的江水。夹岸连
绵不断的桃花灿若云霞，暗香袭人，引来许多蜜蜂在花树间飞舞。
LONG
        );
        set("outdoors", "wudujiao");

        set("exits", ([
                "southeast" : __DIR__"xiao3",
                "north" : __DIR__"xiao1",
        ]));

        setup();
        //replace_program(ROOM);
}

