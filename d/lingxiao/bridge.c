inherit ROOM;

void create()
{
        set("short", "小桥");
        set("long", @LONG 
这是一座江南园林似的小桥，桥下莲叶田田，清波荡漾，水
滑栏碧，池鱼自得。城外虽有雪花飞舞之姿，朔风呼号之势，此
处却得地气温暖之润，得天独厚，有如江南之景，现于西域大漠
之地。
LONG);
        set("outdoors", "lingxiao");
        set("exits",([
            	"south"  : __DIR__"houyuan2",  
            	"north"  : __DIR__"book", 
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);

}

