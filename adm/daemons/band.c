// ban.c
// Created by Xiang@XKX

// #include <net/telnet.h>

#define BANNED_SITES "/adm/etc/banned_sites"

void load_sites();
void add(string pattern);
void remove(string pattern);
int  is_banned(string site);
void print();

string *Sites;

void create()
{
	seteuid(getuid());
	load_sites();
}

void load_sites()
{
	string *tmp, file;
	int loop;

	Sites = ({ });

	// reads in the list of the banned sites
	file = read_file(BANNED_SITES);
	if (! file) return;
	
	tmp = explode(file, "\n");
   	for (loop = 0; loop < sizeof(tmp); loop++)
        	if (tmp[loop][0] == '#' || tmp[loop][0] == '\n' || tmp[loop] == "")
           		continue;
        	else Sites += ({ tmp[loop] });
}

int is_banned(string site)
{
        string line;

        site = replace_string(site, "*", "%*d");

	foreach (line in Sites)
        {
                line = replace_string(line, "*", "%*d");
                if (site == line || sscanf(site, line) == 1)
                        return 1;
        }

	return 0;
}

void print()
{
	int i;
	if (! sizeof(Sites))
	{
		write("现在没有禁止任何IP上本站点。\n");
		return;
	}

	write("以下是禁止上本站点的IP地址列表。\n");
	for (i = 0; i < sizeof(Sites); i++)
		write(Sites[i] + "\n");
}

void add_site(string site)
{
//	int i;

        if (member_array(site, Sites) == -1)
        {
	        Sites += ({ site });
	        write_file(BANNED_SITES, site + "\n", 0);
        }
}

void remove_site(string site)
{
        if (member_array(site, Sites) != -1)
        {
                Sites -= ({ site });
                write_file(BANNED_SITES, implode(Sites, "\n") + "\n", 1);
        }
}