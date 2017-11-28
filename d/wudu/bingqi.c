inherit ROOM;

void create()
{
        set("short", "兵器房");
        set("long", @LONG
这里是五毒教存放武器的地方，四面靠墙全是兵器架，上面插满
了各种兵器。  
LONG);

        set("exits", ([
                "west" : __DIR__"beiyuan",
        ]));
        set("objects", ([
                  __DIR__"obj/ganggou": 2,
                  __DIR__"obj/woodjian": 2,
        ]));
    
        setup();
        //replace_program(ROOM);
}

