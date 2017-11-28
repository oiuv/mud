inherit ROOM;

void create()
{
        set("short","龙门镖局");
        set("long", @LONG
这儿是中州第一号镖局，正对面是一人多高的香案，双旁
坐着众位镖头。亭中央的虎头椅上正是龙门镖局的总镖头都大
锦。右边邻着中州城的文定北街。
LONG);

        set("exits", ([
                "east" : __DIR__"wendingbei4",
                 
        ]));

        set("objects",([
                __DIR__"npc/dudajin":1,
        ]));
        setup();
        replace_program(ROOM);
}
