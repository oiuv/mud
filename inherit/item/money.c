// money.c

inherit COMBINED_ITEM;

int is_money() { return 1; }
int value() { return query_amount() * (int)query("base_value"); }

string query_autoload() { return query_amount() + ""; }

void autoload(string param)
{
	int amt;

	if( sscanf(param, "%d", amt)==1 )
		set_amount(amt);
}
