//Room: xiaojinghu.c

inherit ROOM;

void create ()
{
        set ("short", "小镜湖");
        set ("long", @LONG
这里就是长安城的小镜湖了。小镜湖的面积并不是很大，但亭台楼
阁，假山长廊却也是有的。建筑的朴素简单，而不奢华。湖水叮叮咚咚
的流，世人的烦恼在这里似乎都消失了。夕阳西下时悠闲的人们总是到
这来散步，聊天小憩。
LONG);
        set("exits",([//sizeof() == 1
        	"south" : __DIR__"huarui4",
        ]));
        
        set("resource", ([ /* sizeof() == 1 */
        	"water" : 1,
        ]));
        
        set("outdoors", "changan");
        setup();
        replace_program(ROOM);
}
        