inherit ROOM;

void create()
{
        set("short", "密道");
        set("long", @LONG
这里是五毒教花园下面的一条狭窄的暗道。阴森可怕，到
处积满了灰尘，结满了蛛网，也不知道通往何处。
LONG);
        set("exits", ([
                "up"   : __DIR__"huating2",
                "west" : __DIR__"midao2",
        ]));
 //新增解密千蛛万毒所需的火把 2017-02-10       
         set("objects", ([
                  __DIR__"obj/huoba": 1,
        ]));
        setup();
        //replace_program(ROOM);
}
