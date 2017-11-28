// roommaker.c
// for ESLib

#define RMK_VERSION "(v1.1)"

inherit ITEM;
inherit F_AUTOLOAD;

string *special_props = ({
	"short", "long" });

int save_room_file(string yn, string file, string str);

void create()
{
	set_name("房间编辑器" + RMK_VERSION, ({ "roommaker", "maker" }) );
	set_weight(100);
	set("unit", "个" );
	set("long", @LONG
这是一个用来「快速」制造房间的工具，帮助时间不多或有严重  lag 的巫师
利用线上输入制造简单的房间，不过如果你想提高自己区域房间的品质，最好
不要太依赖这个东西，你可以使用以下几个指令：

mkroom <房间档名>

    造出一个「空」房间，之後你可以 goto 到这个房间用 rset 设定房间的
    叙述或属性。

rset <房间属性> <属性内容>

    设定你目前所在房间的属性，如 short，long 等。

connect <方向> <房间档名>

    将你目前所在的房间连接一个出口到另一个房间。

saveroom

    将你目前所在的房间存档。
LONG
	);
}

int query_autoload() { return 1; }

void init()
{
	if( wizardp(environment()) ) {
		seteuid(getuid(environment()));
		add_action("do_mkroom", "mkroom");
		add_action("do_rset", "rset");
		add_action("do_connect", "connect");
		add_action("do_saveroom", "saveroom");
	}
}

int do_mkroom(string arg)
{
	string file, dir, code;

	if( !arg ) return notify_fail("指令格式：mkroom <房间档名> [<方向>]\n");
	if( sscanf(arg, "%s %s", file, dir)!=2 )
		file = arg;
	seteuid(geteuid(this_player()));
	file = resolve_path(this_player()->query("cwd"), file) + ".c";
	if( file_size(file)!=-1 )
		return notify_fail("档案 " + file + " 已经存在了。\n");
	if( !write_file(file, @ROOM_CODE
// This is a room made by roommaker.

inherit ROOM;

void create()
{
	set("short", "空房间");
	set("long", "这是一间什麽也没有的空房间。\n");
	setup();
	replace_program(ROOM);
}
ROOM_CODE
	) ) return notify_fail("你没有写入档案(" + file +")的权利。\n");
	message_vision("只听到$N的房间编辑器「哔」的一声，你觉得这个世界又变大了一点。\n", this_player());
	return 1;
}

int do_rset(string arg)
{
	string prop, str;
	mixed data;

	if( !arg || sscanf(arg, "%s %s", prop, str)!=2 )
		return notify_fail("指令格式：rset <房间属性> <属性内容>\n");

	if( sscanf(str, "%d", data)!=1 )
		data = str;

	environment(this_player())->set(prop, str);
	write("Ok.\n");
	return 1;
}

int do_connect(string arg)
{
	mapping exits;
	string dir, file;

	if( !arg || sscanf(arg, "%s %s", dir, file)!=2 )
		return notify_fail("指令格式：connect <方向> <房间档名>\n");
	file = resolve_path(this_player()->query("cwd"), file);
	exits = environment(this_player())->query("exits");
	if( mapp(exits) )
		exits[dir] = file;
	else
		environment(this_player())->set("exits", ([ dir: file ]) );
	write("Ok.\n");
	return 1;
}

int do_saveroom(string arg)
{
	object env;
	string str, *name, file;
	mapping prop;
	int i;

	env = environment(this_player());
	file = file_name(env) + ".c";
	str = "// Room: " + file + @ROOM_CODE


inherit ROOM;

void create()
{
ROOM_CODE
	;
	str += sprintf("\tset(\"short\", %O);\n", env->query("short") );
	str += sprintf("\tset(\"long\", @LONG\n%sLONG\n\t);\n", env->query("long") );
	prop = env->query_entire_dbase();
	name = keys(prop);
	for(i=0; i<sizeof(name); i++) {
		if( member_array(name[i], special_props)!=-1 ) continue;
		str += sprintf("\tset(\"%s\", %O);\n", name[i], prop[name[i]] );
	}
	str += "\n\tsetup();\n\treplace_program(ROOM);\n}\n";

	// Replace current directory with __DIR__ macro to make relocatable code.
	i = strlen(file)-1;
	while( (i > 0) && (file[i]!='/')) i--;
	if( i>0 ) {
		write("目前目录：" + file[0..i] + " 以 __DIR__ 取代。\n");
		str = replace_string(str, "\"" + file[0..i], "__DIR__\"");
	}

	if( file_size(file)!=-1 ) {
		write("档案 " + file + " 已存在，要删除旧档吗？[y/n]");
		input_to("save_room_file", file, str);
		return 1;
	}

	return save_room_file("y", file, str);
}

int save_room_file(string yn, string file, string str)
{
	if( strlen(yn)<1 || yn[0]!='y' ) return 1;

	rm(file);
	write("存档 " + file + "....");
	if( write_file(file, str) ) {
		write("Ok.\n");
		return 1;
	} else
		return notify_fail("你没有写入这个档案(" + file + ")的权利。\n");
}

void owner_is_killed() { destruct(this_object()); }
