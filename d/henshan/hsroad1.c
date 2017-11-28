inherit ROOM;

void create()
{
       set("short", "土路");	
       set("long", @LONG
你走在一条尘土飞扬的黄土路上，两旁满是阴森森的树林。
这里向北通往扬州，往南就进入湖南地界了。
LONG );    
 
      set("outdoors", "henshan");  
   
      set("exits", ([
		"northdown" : "/d/wudang/wdroad4",	
                "southeast" : __DIR__"hsroad2",

	]));

	setup();
	replace_program(ROOM);
}
