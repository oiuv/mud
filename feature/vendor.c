// vendor.c

#include <dbase.h>

int buy_object(object me, string what)
{
	string ob;

	if( stringp(ob = query("vendor_goods/" + what)) )
		return ob->query("value");
	else
		return 0;
}

void compelete_trade(object me, string what)
{
	string ob_file;
	object ob;

	if( stringp(ob_file = query("vendor_goods/" + what)) ) {
		ob = new(ob_file);
		ob->move(me);
		message_vision("$N向$n买下一" + ob->query("unit") + ob->query("name") + "。\n",
			me, this_object() );
	}
}

string price_string(int v)
{
	if( v%10000 == 0 )
		return chinese_number(v/10000) + "两黄金";
	if( v%100 == 0 )
		return chinese_number(v/100) + "两白银";
	return chinese_number(v) + "文铜板";
}

int do_vendor_list(string arg)
{
	mapping goods;
	string list, *name;
	int i;

	if( !mapp(goods = query("vendor_goods")) ) return 0;
	if( arg && !this_object()->id(arg) ) return 0;
	name = keys(goods);
	list = "你可以购买下列这些东西：\n";
	for(i=0; i<sizeof(name); i++)
		list += sprintf("%-30s：%s\n",
			goods[name[i]]->query("name") + "(" +
			goods[name[i]]->query("id") + ")",
			price_string(goods[name[i]]->query("value")) );
	write(list);
	return 1;	
}
