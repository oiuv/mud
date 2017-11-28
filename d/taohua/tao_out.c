inherit ROOM;

void create()
{
        set("short", "桃林边");
        set("long", @LONG
这是片桃花的海洋。四周一望无际全是盛开的桃花。微风
拂过，落英缤纷。周围静悄悄的。远处偶尔传来一声鸟叫。往
北是一片桃花林，往南则是一个小亭子。
LONG );
       	set("exits", ([
           	"south" : __DIR__"tingzi",
           	"north" : __DIR__"tao0",
       	]));
       	set("outdoors","taohua");
       	setup();
	replace_program(ROOM);
}

